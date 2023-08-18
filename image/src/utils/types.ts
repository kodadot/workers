export interface CFIApiResponse {
  errors: any[];
  messages: any[];
  result: {
    filename: string;
    id: string;
    meta: {
      key: string;
    };
    requireSignedURLs: boolean;
    uploaded: string;
    variants: string[];
  } | null;
  success: boolean;
}
