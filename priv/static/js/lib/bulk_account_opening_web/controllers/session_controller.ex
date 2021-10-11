defmodule BulkAccountOpeningWeb.SessionController do
  use BulkAccountOpeningWeb, :controller

  def login(conn, _params) do
    render(conn, "login.html")
  end

  def signup(conn, _params) do
    render(conn, "signup.html")
  end
end
