defmodule BulkAccountOpeningWeb.PageController do
  use BulkAccountOpeningWeb, :controller

  def login(conn, _params) do
    render(conn, "login.html")
  end

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
