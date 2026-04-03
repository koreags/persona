"""
인물지 블로그 — 자동 뉴스 크롤러
매일 실행되어 인물 관련 뉴스를 수집하고 Claude API로 요약 후 Supabase에 저장합니다.

수집 출처 (합법적 API/공식 RSS만 사용):
  1. NewsAPI (newsapi.org)  — 유료 라이선스, 제목/링크/요약 제공
  2. BBC News RSS           — BBC 공식 제공 피드
  3. CNBC RSS               — CNBC 공식 제공 피드
"""

import os
import json
import requests
import xml.etree.ElementTree as ET
from datetime import datetime, date
from dotenv import load_dotenv

load_dotenv()

SUPABASE_URL        = os.environ["SUPABASE_URL"]
SUPABASE_SECRET_KEY = os.environ["SUPABASE_SECRET_KEY"]
ANTHROPIC_API_KEY   = os.environ["ANTHROPIC_API_KEY"]
NEWS_API_KEY        = os.environ.get("NEWS_API_KEY", "")

HEADERS = {
    "apikey": SUPABASE_SECRET_KEY,
    "Authorization": f"Bearer {SUPABASE_SECRET_KEY}",
    "Content-Type": "application/json",
}

# 공식 RSS 피드 목록 (제목/링크/요약만 사용, 본문 미접근)
RSS_FEEDS = [
    {"name": "BBC News",  "url": "https://feeds.bbci.co.uk/news/world/rss.xml"},
    {"name": "CNBC",      "url": "https://www.cnbc.com/id/100003114/device/rss/rss.html"},
]

# 항상 포함되는 고정 인물
DEFAULT_PERSONS = [
    {"id": None, "name": "도널드 트럼프", "name_en": "Donald Trump",  "category": "정치"},
    {"id": None, "name": "일론 머스크",   "name_en": "Elon Musk",     "category": "비즈니스"},
]


# ──────────────────────────────────────────
# 1. 추적 인물 목록 가져오기
# ──────────────────────────────────────────
def get_persons():
    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/persons",
        headers=HEADERS,
        params={"active": "eq.true", "select": "id,name,name_en,category"},
    )
    res.raise_for_status()
    return res.json()


# ──────────────────────────────────────────
# 2. 이미 크롤링된 기사 URL 조회
# ──────────────────────────────────────────
def get_crawled_urls():
    """오늘 자정 이전에 크롤링된 기사 URL 집합 반환"""
    today = date.today().isoformat()
    res = requests.get(
        f"{SUPABASE_URL}/rest/v1/posts",
        headers=HEADERS,
        params={
            "select": "sources",
            "crawled_at": f"lt.{today}T00:00:00",
        },
    )
    res.raise_for_status()

    crawled_urls = set()
    for post in res.json():
        try:
            sources = json.loads(post.get("sources") or "[]")
            for s in sources:
                if s.get("url"):
                    crawled_urls.add(s["url"])
        except (json.JSONDecodeError, TypeError):
            pass
    return crawled_urls


# ──────────────────────────────────────────
# 3. 뉴스 수집 (NewsAPI + 공식 RSS)
# ──────────────────────────────────────────
def _fetch_newsapi(query):
    """NewsAPI /v2/everything — 제목·URL·description·출처명 반환"""
    if not NEWS_API_KEY:
        return []
    try:
        res = requests.get(
            "https://newsapi.org/v2/everything",
            params={
                "q":        query,
                "language": "en",
                "sortBy":   "publishedAt",
                "pageSize": 5,
                "apiKey":   NEWS_API_KEY,
            },
            timeout=10,
        )
        res.raise_for_status()
        articles = []
        for a in res.json().get("articles", []):
            if a.get("title") and a.get("url"):
                articles.append({
                    "title":       a["title"],
                    "url":         a["url"],
                    "description": a.get("description") or "",
                    "source":      a.get("source", {}).get("name") or "NewsAPI",
                    "published":   a.get("publishedAt") or "",
                })
        return articles
    except Exception as e:
        print(f"  [NewsAPI] 수집 실패: {e}")
        return []


def _fetch_rss(feed_name, feed_url, query):
    """공식 RSS 피드에서 query 키워드가 제목에 포함된 기사만 반환.
    RSS는 제목·링크·description만 읽으며 본문 페이지에 접근하지 않습니다."""
    keywords = [w.lower() for w in query.split()]
    try:
        res = requests.get(feed_url, timeout=10, headers={"User-Agent": "Mozilla/5.0"})
        root = ET.fromstring(res.content)
        articles = []
        for item in root.findall(".//item"):
            title = item.findtext("title", "").strip()
            link  = item.findtext("link",  "").strip()
            desc  = item.findtext("description", "").strip()
            pub   = item.findtext("pubDate", "").strip()
            if not title or not link:
                continue
            title_lower = title.lower()
            if any(kw in title_lower for kw in keywords):
                articles.append({
                    "title":       title,
                    "url":         link,
                    "description": desc,
                    "source":      feed_name,
                    "published":   pub,
                })
        return articles
    except Exception as e:
        print(f"  [{feed_name} RSS] 수집 실패: {e}")
        return []


def fetch_news(person_name_en):
    """NewsAPI + 공식 RSS 피드에서 인물 관련 기사 수집 (최대 6건)"""
    query = (person_name_en or "").strip()
    if not query:
        return []

    articles = _fetch_newsapi(query)

    for feed in RSS_FEEDS:
        articles += _fetch_rss(feed["name"], feed["url"], query)

    # 중복 URL 제거
    seen, unique = set(), []
    for a in articles:
        if a["url"] not in seen:
            seen.add(a["url"])
            unique.append(a)

    return unique[:6]


# ──────────────────────────────────────────
# 4. Claude API로 요약 생성
# ──────────────────────────────────────────
def summarize_with_claude(person_name, articles):
    """수집된 기사 메타데이터(제목·요약·출처)만으로 한국어 블로그 포스트 생성"""

    articles_text = "\n\n".join([
        f"출처: {a['source']}\n제목: {a['title']}\n요약: {a['description']}"
        for a in articles
    ])

    prompt = f"""다음은 {person_name}에 관한 최신 뉴스 기사 메타데이터입니다 (제목·요약·출처만 제공됩니다).

{articles_text}

위 정보를 바탕으로 자연스러운 한국어 블로그 포스트를 작성해주세요.

요구사항:
- 제목: 핵심 내용을 담은 블로그 제목 (50자 이내)
- 본문: 300~500자 분량으로 핵심 내용을 재구성
- 원문 문장을 직접 번역하거나 인용하지 말 것
- 출처는 영문 매체명으로만 표시 (BBC News, CNBC 등)
- URL을 본문에 포함하지 말 것

아래 JSON 형식으로만 응답하세요 (다른 텍스트 없이):
{{
  "title": "블로그 제목",
  "content": "본문 내용"
}}"""

    res = requests.post(
        "https://api.anthropic.com/v1/messages",
        headers={
            "x-api-key": ANTHROPIC_API_KEY,
            "anthropic-version": "2023-06-01",
            "content-type": "application/json",
        },
        json={
            "model": "claude-sonnet-4-5",
            "max_tokens": 1024,
            "messages": [{"role": "user", "content": prompt}],
        },
        timeout=30,
    )
    res.raise_for_status()

    text = res.json()["content"][0]["text"].strip()
    text = text.replace("```json", "").replace("```", "").strip()
    return json.loads(text)


# ──────────────────────────────────────────
# 5. Supabase에 초안 저장
# ──────────────────────────────────────────
def save_draft(person, summary, articles):
    """요약된 내용을 Supabase posts 테이블에 draft로 저장.
    sources에는 제목·URL·출처명만 기록합니다."""

    sources = [{"title": a["title"], "url": a["url"], "source": a["source"]} for a in articles]
    excerpt = summary["content"][:200] + "..."

    payload = {
        "person_name": person["name"],
        "title":       summary["title"],
        "content":     summary["content"],
        "excerpt":     excerpt,
        "category":    person["category"],
        "post_type":   "ai",
        "status":      "draft",
        "sources":     json.dumps(sources),
        "crawled_at":  datetime.utcnow().isoformat(),
    }
    if person["id"] is not None:
        payload["person_id"] = person["id"]

    res = requests.post(
        f"{SUPABASE_URL}/rest/v1/posts",
        headers={**HEADERS, "Prefer": "return=representation"},
        json=payload,
    )
    res.raise_for_status()
    return res.json()[0]["id"]


# ──────────────────────────────────────────
# 6. 크롤 로그 저장
# ──────────────────────────────────────────
def save_log(person_id, person_name, status, articles_found=0, post_id=None, error=None):
    payload = {
        "person_id":      person_id,
        "person_name":    person_name,
        "status":         status,
        "articles_found": articles_found,
        "post_created":   post_id is not None,
        "post_id":        post_id,
        "error_message":  error,
    }
    requests.post(
        f"{SUPABASE_URL}/rest/v1/crawl_logs",
        headers=HEADERS,
        json=payload,
    )


# ──────────────────────────────────────────
# 메인 실행
# ──────────────────────────────────────────
def main():
    print(f"\n{'='*50}")
    print(f"크롤러 시작: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    if not NEWS_API_KEY:
        print("  ⚠️  NEWS_API_KEY 미설정 — NewsAPI 수집 건너뜀 (RSS만 사용)")
    print(f"{'='*50}\n")

    db_persons = get_persons()
    db_names = {p["name"] for p in db_persons}
    extra = [p for p in DEFAULT_PERSONS if p["name"] not in db_names]
    persons = extra + db_persons
    print(f"추적 인물 {len(persons)}명 확인 (고정 {len(extra)}명 포함)\n")

    crawled_urls = get_crawled_urls()
    print(f"기존 크롤링 URL {len(crawled_urls)}건 로드 완료\n")

    for person in persons:
        name = person["name"]
        print(f"▶ {name} 처리 중...")

        try:
            raw_articles = fetch_news(person.get("name_en", ""))
            articles = [a for a in raw_articles if a["url"] not in crawled_urls]
            skipped = len(raw_articles) - len(articles)
            if skipped:
                print(f"  중복 {skipped}건 제외")
            print(f"  뉴스 {len(articles)}건 수집 (NewsAPI + BBC + CNBC)")

            if not articles:
                print(f"  뉴스 없음 — 건너뜀\n")
                save_log(person["id"], name, "no_news")
                continue

            print(f"  Claude API 요약 중...")
            summary = summarize_with_claude(name, articles)
            print(f"  제목: {summary['title']}")

            post_id = save_draft(person, summary, articles)
            print(f"  ✅ 초안 저장 완료 (id: {post_id})\n")

            save_log(person["id"], name, "success", len(articles), post_id)

        except Exception as e:
            print(f"  ❌ 오류: {e}\n")
            if hasattr(e, 'response') and e.response is not None:
                print(f"  상세: {e.response.text}\n")
            save_log(person["id"], name, "fail", error=str(e))

    print(f"{'='*50}")
    print(f"크롤러 완료: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*50}\n")


if __name__ == "__main__":
    main()
