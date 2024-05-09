use actix_web::{main, App, HttpServer};


#[main]
async fn main() -> std::io::Result<()> {
    let port = 8080;
    println!("Backend is gonna be lit!!!! #rustftw. Server running on port {}", port);

    HttpServer::new(move || App::new())
        .bind(("127.0.0.1", port))?
        .workers(2)
        .run()
        .await
}

