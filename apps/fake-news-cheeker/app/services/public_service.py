from app.database import get_db
from sqlalchemy import text

class PublicService:
    @staticmethod
    def query_all(sql, params=None, page=1, limit=10):
        offset = (page - 1) * limit
        paginated_sql = f"{sql} LIMIT :limit OFFSET :offset"

        # Ensure params is dict for named parameters
        full_params = params.copy() if params else {}
        full_params.update({
            "limit": limit,
            "offset": offset
        })

        with get_db() as session:
            stmt = text(paginated_sql)
            result = session.execute(stmt, full_params)
            cols = result.keys()
            return [dict(zip(cols, row)) for row in result.fetchall()]

    @staticmethod
    def get_all_claims(page=1, limit=10):
        return PublicService.query_all("SELECT * FROM claims", page=page, limit=limit)

    @staticmethod
    def get_high_confidence_claims(page=1, limit=10):
        return PublicService.query_all("SELECT * FROM claims WHERE confidence > 0.8", page=page, limit=limit)

    @staticmethod
    def get_claims_by_category(category, page=1, limit=10):
        return PublicService.query_all(
            "SELECT * FROM claims WHERE category = :category",
            {"category": category},
            page=page,
            limit=limit
        )

    @staticmethod
    def get_all_sources(page=1, limit=10):
        return PublicService.query_all("SELECT * FROM sources", page=page, limit=limit)

    @staticmethod
    def get_sources_by_domain(domain, page=1, limit=10):
        return PublicService.query_all(
            "SELECT * FROM sources WHERE domain = :domain",
            {"domain": domain},
            page=page,
            limit=limit
        )

    @staticmethod
    def get_all_analyses(page=1, limit=10):
        return PublicService.query_all("""
            SELECT 
                a.id AS analysis_id,
                c.text AS claim_text,
                c.conclusion,
                s.url AS source_url,
                a.support,
                a.confidence,
                a.reason,
                a.analysis_text,
                a.created_at
            FROM analyses a
            JOIN claims c ON a.claim_id = c.id
            JOIN sources s ON a.source_id = s.id
        """, page=page, limit=limit)

    @staticmethod
    def get_supported_analyses(page=1, limit=10):
        return PublicService.query_all("""
            SELECT 
                a.id,
                c.text AS claim_text,
                c.conclusion,
                s.url AS source_url,
                a.support,
                a.confidence
            FROM analyses a
            JOIN claims c ON a.claim_id = c.id
            JOIN sources s ON a.source_id = s.id
            WHERE a.support = 'Supported'
        """, page=page, limit=limit)

    @staticmethod
    def get_latest_analyses(page=1, limit=10):
        return PublicService.query_all("""
            SELECT 
                a.id,
                c.text AS claim_text,
                c.conclusion,
                s.url AS source_url,
                a.support,
                a.confidence,
                a.created_at
            FROM analyses a
            JOIN claims c ON a.claim_id = c.id
            JOIN sources s ON a.source_id = s.id
            ORDER BY a.created_at DESC
        """, page=page, limit=limit)
