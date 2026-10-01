import re
from database.db import get_db_connection

def search_knowledge_base(query, top_k=3):
    """
    Searches the SQLite database for Knowledge Base articles and FAQs matching the user query.
    Calculates word overlap & relevance score.
    Returns structured list of matches with source information.
    """
    if not query:
        return []

    # Clean and tokenize query words
    cleaned_query = re.sub(r'[^\w\s]', '', query.lower())
    query_tokens = set(cleaned_query.split())
    # Exclude basic stopwords
    stopwords = {'a', 'an', 'the', 'is', 'are', 'was', 'were', 'what', 'where', 'how', 'when', 'who', 'which', 'do', 'does', 'did', 'for', 'in', 'on', 'at', 'to', 'of', 'and', 'or', 'my', 'can', 'i', 'you', 'please', 'tell', 'me', 'about'}
    search_tokens = query_tokens - stopwords
    if not search_tokens:
        search_tokens = query_tokens

    conn = get_db_connection()
    cursor = conn.cursor()

    results = []

    # 1. Search Knowledge Base
    cursor.execute("SELECT id, category, title, content, keywords, department_contact FROM knowledge_base")
    kb_rows = cursor.fetchall()

    for row in kb_rows:
        text = f"{row['category']} {row['title']} {row['content']} {row['keywords']}".lower()
        score = 0
        for token in search_tokens:
            if token in text:
                score += 2 if token in row['title'].lower() or token in row['keywords'].lower() else 1

        if score > 0:
            results.append({
                "type": "Knowledge Base",
                "category": row["category"],
                "title": row["title"],
                "content": row["content"],
                "department_contact": row["department_contact"],
                "score": score
            })

    # 2. Search FAQs
    cursor.execute("SELECT id, category, question, answer FROM faqs")
    faq_rows = cursor.fetchall()

    for row in faq_rows:
        text = f"{row['category']} {row['question']} {row['answer']}".lower()
        score = 0
        for token in search_tokens:
            if token in text:
                score += 3 if token in row['question'].lower() else 1

        if score > 0:
            results.append({
                "type": "FAQ",
                "category": row["category"],
                "title": row["question"],
                "content": row["answer"],
                "department_contact": None,
                "score": score
            })

    conn.close()

    # Sort results by relevance score descending
    results.sort(key=lambda x: x["score"], reverse=True)
    return results[:top_k]
