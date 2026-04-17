/** JSDoc reference types — mirrors EcourtsIndia Partner API */

export interface CourtCaseData {
  cnr: string;
  caseNumber: string;
  caseType: string;
  caseStatus: string;
  filingNumber: string;
  filingDate: string;
  registrationNumber: string;
  registrationDate: string;
  firstHearingDate: string;
  nextHearingDate: string | null;
  decisionDate: string | null;
  judges: string[];
  petitioners: string[];
  petitionerAdvocates: string[];
  respondents: string[];
  respondentAdvocates: string[];
  actsAndSections: string;
  caseCategoryFacetPath: string;
  courtName: string;
  courtNo: number;
  state: string;
  district: string;
  benchName: string;
  purpose: string;
  judicialSection: string;
  caseTypeSub: string;
  causelistType: string;
  taggedMatters: unknown[];
  earlierCourtDetails: unknown[];
  interlocutoryApplications: unknown[];
  listingDates: unknown[];
  notices: unknown[];
  /** `orderUrl` per docs; some responses use `order_url` — use `orderFilenameFromRow()` when reading. */
  judgmentOrders: Array<{ orderDate: string; orderType: string; orderUrl: string; order_url?: string }>;
  interimOrders: Array<{
    orderDate: string;
    description: string;
    orderUrl: string;
    order_url?: string;
    stage: string;
    remarks: string;
  }>;
  historyOfCaseHearings: Array<{
    causeListType: string;
    judge: string;
    businessOnDate: string;
    hearingDate: string;
    purposeOfListing: string;
  }>;
  filedDocuments: unknown[];
  linkCases: unknown[];
  subordinateCourt: unknown;
  firDetails: unknown;
  caveatDetails: unknown[];
  processes: unknown;
}

export interface CaseDetailResponse {
  data: {
    courtCaseData: CourtCaseData;
    entityInfo: {
      cnr: string;
      nextDateOfHearing: string | null;
      lastDateOfHearing: string | null;
      dateCreated: string;
      dateModified: string;
    };
    files?: { files: unknown[] };
    caseAiAnalysis: {
      caseSummary: string;
      caseType: string;
      complexity: string;
      keyIssues: string[];
      timeline: Array<{ date: string; event: string }>;
    } | null;
  };
  meta: { requestId: string };
}

export interface SearchResult {
  id: string;
  cnr: string;
  caseType: string;
  caseStatus: string;
  filingNumber: string;
  filingDate: string;
  registrationNumber: string;
  registrationDate: string;
  nextHearingDate: string | null;
  decisionDate: string | null;
  judges: string[];
  petitioners: string[];
  petitionerAdvocates: string[];
  respondents: string[];
  respondentAdvocates: string[];
  actsAndSections: string[];
  courtCode: string;
  judicialSection: string;
  caseCategory: string;
  benchType: string;
  aiKeywords: string[];
}

export interface SearchResponse {
  data: {
    results: SearchResult[];
    totalHits: number;
    page: number;
    pageSize: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
    processingTimeMs: number;
    facets: Record<string, unknown>;
  };
  meta: { requestId: string };
}

export interface RefreshResponse {
  data: {
    cnr: string;
    status: string;
    message: string;
    estimatedTime: string;
  };
  meta: { request_id: string };
}
