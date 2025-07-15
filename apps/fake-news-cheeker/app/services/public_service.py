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
    def get_count(sql, params=None):
        """Get total count for a query"""
        with get_db() as session:
            stmt = text(f"SELECT COUNT(*) as count FROM ({sql}) as subquery")
            result = session.execute(stmt, params or {})
            row = result.fetchone()
            return row[0] if row else 0

    @staticmethod
    def get_paginated_response(data, total_count, page, limit):
        """Create a standardized paginated response"""
        total_pages = (total_count + limit - 1) // limit
        return {
            "data": data,
            "pagination": {
                "page": page,
                "limit": limit,
                "total": total_count,
                "total_pages": total_pages,
                "has_next": page < total_pages,
                "has_prev": page > 1
            }
        }

    @staticmethod
    def get_all_claims(page=1, limit=10, search=None, category=None, verdict=None):
        conditions = []
        params = {}
        
        if search:
            conditions.append("text ILIKE :search")
            params["search"] = f"%{search}%"
        
        if category and category != "all":
            conditions.append("category = :category")
            params["category"] = category
        
        if verdict and verdict != "all":
            conditions.append("verdict = :verdict")
            params["verdict"] = verdict
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        sql = f"SELECT * FROM claims WHERE {where_clause} ORDER BY created_at DESC"
        
        data = PublicService.query_all(sql, params, page, limit)
        total_count = PublicService.get_count(sql, params)
        
        return PublicService.get_paginated_response(data, total_count, page, limit)

    @staticmethod
    def get_claims_count():
        return PublicService.get_count("SELECT * FROM claims")

    @staticmethod
    def get_high_confidence_claims(page=1, limit=10):
        sql = "SELECT * FROM claims WHERE confidence > 0.8 ORDER BY created_at DESC"
        data = PublicService.query_all(sql, page=page, limit=limit)
        total_count = PublicService.get_count(sql)
        return PublicService.get_paginated_response(data, total_count, page, limit)

    @staticmethod
    def get_high_confidence_claims_count():
        return PublicService.get_count("SELECT * FROM claims WHERE confidence > 0.8")

    @staticmethod
    def get_claims_by_category(category, page=1, limit=10):
        sql = "SELECT * FROM claims WHERE category = :category ORDER BY created_at DESC"
        params = {"category": category}
        data = PublicService.query_all(sql, params, page=page, limit=limit)
        total_count = PublicService.get_count(sql, params)
        return PublicService.get_paginated_response(data, total_count, page, limit)

    @staticmethod
    def get_all_sources(page=1, limit=10, search=None, domain=None):
        conditions = []
        params = {}
        
        if search:
            conditions.append("(title ILIKE :search OR domain ILIKE :search OR source_name ILIKE :search)")
            params["search"] = f"%{search}%"
        
        if domain and domain != "all":
            conditions.append("domain = :domain")
            params["domain"] = domain
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        sql = f"SELECT * FROM sources WHERE {where_clause} ORDER BY last_scraped_at DESC NULLS LAST"
        
        data = PublicService.query_all(sql, params, page, limit)
        total_count = PublicService.get_count(sql, params)
        
        return PublicService.get_paginated_response(data, total_count, page, limit)

    @staticmethod
    def get_sources_count():
        return PublicService.get_count("SELECT * FROM sources")

    @staticmethod
    def get_sources_by_domain(domain, page=1, limit=10):
        sql = "SELECT * FROM sources WHERE domain = :domain ORDER BY last_scraped_at DESC NULLS LAST"
        params = {"domain": domain}
        data = PublicService.query_all(sql, params, page=page, limit=limit)
        total_count = PublicService.get_count(sql, params)
        return PublicService.get_paginated_response(data, total_count, page, limit)

    @staticmethod
    def get_all_analyses(page=1, limit=10, search=None, support=None):
        conditions = []
        params = {}
        
        if search:
            conditions.append("c.text ILIKE :search")
            params["search"] = f"%{search}%"
        
        if support and support != "all":
            conditions.append("a.support = :support")
            params["support"] = support
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        sql = f"""
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
            WHERE {where_clause}
            ORDER BY a.created_at DESC
        """
        
        data = PublicService.query_all(sql, params, page, limit)
        total_count = PublicService.get_count(sql, params)
        
        return PublicService.get_paginated_response(data, total_count, page, limit)

    @staticmethod
    def get_analyses_count():
        return PublicService.get_count("""
            SELECT a.id FROM analyses a
            JOIN claims c ON a.claim_id = c.id
            JOIN sources s ON a.source_id = s.id
        """)

    @staticmethod
    def get_supported_analyses(page=1, limit=10):
        sql = """
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
            ORDER BY a.created_at DESC
        """
        data = PublicService.query_all(sql, page=page, limit=limit)
        total_count = PublicService.get_count(sql)
        return PublicService.get_paginated_response(data, total_count, page, limit)

    @staticmethod
    def get_supported_analyses_count():
        return PublicService.get_count("""
            SELECT a.id FROM analyses a
            JOIN claims c ON a.claim_id = c.id
            JOIN sources s ON a.source_id = s.id
            WHERE a.support = 'Supported'
        """)

    @staticmethod
    def get_latest_analyses(page=1, limit=10):
        sql = """
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
        """
        data = PublicService.query_all(sql, page=page, limit=limit)
        total_count = PublicService.get_count(sql)
        return PublicService.get_paginated_response(data, total_count, page, limit)

    @staticmethod
    def get_latest_analyses_count():
        return PublicService.get_count("""
            SELECT a.id FROM analyses a
            JOIN claims c ON a.claim_id = c.id
            JOIN sources s ON a.source_id = s.id
            ORDER BY a.created_at DESC
        """)

    @staticmethod
    def get_system_stats():
        """Get comprehensive system statistics"""
        try:
            with get_db() as session:
                # Get all counts in a single query for efficiency
                stats_query = """
                    SELECT 
                        (SELECT COUNT(*) FROM claims) as total_claims,
                        (SELECT COUNT(*) FROM sources) as total_sources,
                        (SELECT COUNT(*) FROM analyses) as total_analyses,
                        (SELECT COUNT(*) FROM claims WHERE confidence > 0.8) as high_confidence_claims,
                        (SELECT COUNT(*) FROM analyses WHERE support = 'Supported') as supported_analyses,
                        (SELECT COUNT(*) FROM analyses WHERE created_at >= NOW() - INTERVAL '24 hours') as recent_analyses
                """
                result = session.execute(text(stats_query))
                row = result.fetchone()
                
                if row:
                    return {
                        "total_claims": row[0] or 0,
                        "total_sources": row[1] or 0,
                        "total_analyses": row[2] or 0,
                        "high_confidence_claims": row[3] or 0,
                        "supported_analyses": row[4] or 0,
                        "recent_analyses": row[5] or 0
                    }
                else:
                    return {
                        "total_claims": 0,
                        "total_sources": 0,
                        "total_analyses": 0,
                        "high_confidence_claims": 0,
                        "supported_analyses": 0,
                        "recent_analyses": 0
                    }
        except Exception as e:
            print(f"Error getting system stats: {e}")
            return {
                "total_claims": 0,
                "total_sources": 0,
                "total_analyses": 0,
                "high_confidence_claims": 0,
                "supported_analyses": 0,
                "recent_analyses": 0
            }

    # Export methods for CSV (without pagination)
    @staticmethod
    def export_claims_csv(search=None, category=None, verdict=None):
        """Export claims data for CSV without pagination"""
        conditions = []
        params = {}
        
        if search:
            conditions.append("text ILIKE :search")
            params["search"] = f"%{search}%"
        
        if category and category != "all":
            conditions.append("category = :category")
            params["category"] = category
        
        if verdict and verdict != "all":
            conditions.append("verdict = :verdict")
            params["verdict"] = verdict
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        sql = f"SELECT * FROM claims WHERE {where_clause} ORDER BY created_at DESC"
        
        return PublicService.query_all(sql, params, page=1, limit=10000)  # Large limit for export

    @staticmethod
    def export_sources_csv(search=None, domain=None):
        """Export sources data for CSV without pagination"""
        conditions = []
        params = {}
        
        if search:
            conditions.append("(title ILIKE :search OR domain ILIKE :search OR source_name ILIKE :search)")
            params["search"] = f"%{search}%"
        
        if domain and domain != "all":
            conditions.append("domain = :domain")
            params["domain"] = domain
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        sql = f"SELECT * FROM sources WHERE {where_clause} ORDER BY last_scraped_at DESC NULLS LAST"
        
        return PublicService.query_all(sql, params, page=1, limit=10000)  # Large limit for export

    @staticmethod
    def export_analyses_csv(search=None, support=None):
        """Export analyses data for CSV without pagination"""
        conditions = []
        params = {}
        
        if search:
            conditions.append("c.text ILIKE :search")
            params["search"] = f"%{search}%"
        
        if support and support != "all":
            conditions.append("a.support = :support")
            params["support"] = support
        
        where_clause = " AND ".join(conditions) if conditions else "1=1"
        sql = f"""
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
            WHERE {where_clause}
            ORDER BY a.created_at DESC
        """
        
        return PublicService.query_all(sql, params, page=1, limit=10000)  # Large limit for export
