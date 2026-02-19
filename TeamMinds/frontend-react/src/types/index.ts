export type Severity = 'critical' | 'high' | 'medium' | 'low';

export interface Issue {
    id?: string;
    type: Severity;
    issue: string;
    fix?: string;
}

export interface AnalysisSummary {
    confidence_score: number;
    security_improvement?: number;
    performance_improvement?: number;
    quality_score: number;
    improvement_summary: string;
    time_complexity?: string;
    space_complexity?: string;
    resource_impact?: string;
    suggested_challenges?: { name: string; link: string; platform?: string }[];
}

export interface ReviewResponse extends AnalysisSummary {
    critical_issues: string[];
    high_issues: string[];
    medium_issues: string[];
    low_issues: string[];
    fixed_code?: string;
    rewritten_code?: string; // Some endpoints might use this
}

export interface RewriteResponse {
    rewritten_code: string;
    explanation: string;
    performance_gain: string;
}

export interface ValidationResult {
    test_name: string;
    original_status: 'PASS' | 'FAIL';
    rewritten_status: 'PASS' | 'FAIL';
    error_message?: string;
}

export interface ExecResponse {
    output: string;
    error: string;
    status: 'success' | 'error';
}

export interface HistoryItem {
    id: number;
    filename: string;
    timestamp: string;
    analysis_type: string;
    summary: string;
    confidence_score: number;
}
