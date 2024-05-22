pub fn scope_routes(root_path: &str, paths: ()) {
    return scope("")
    .service(auth_controllers::login_handler)
    .service(auth_controllers::register_user_handler)
    .service(auth_controllers::session_refresh)
}