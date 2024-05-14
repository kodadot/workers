use worker::{ Result, Response, Headers };

#[derive(Debug)]
pub struct CorsHeaders {}

impl CorsHeaders {
    pub fn new() -> Result<Headers> {
        let mut headers = Headers::new();
        headers.set("Access-Control-Allow-Origin", "*")?;
        headers.set("Access-Control-Allow-Methods", "GET, HEAD, POST, OPTIONS")?;
        headers.set("Access-Control-Allow-Headers", "*")?;
        return Ok(headers);
    }

    pub fn response() -> Result<Response> {
        let resp = Response::empty()?.with_headers(CorsHeaders::new()?);
        return Ok(resp);
    }

    pub fn update(response: Result<Response>) -> Result<Response> {
        match response {
            Ok(res) => {
                if res.status_code() == 301 || res.status_code() == 302 {
                    return Ok(res);
                } else {
                    return Ok(res.with_headers(CorsHeaders::new()?));
                }
            },
            Err(err) => return Err(err),
        }
    }
}

