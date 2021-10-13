defmodule EchipatalaWeb.PharmacyController do
  use EchipatalaWeb, :controller

  def index(conn, _params) do
    render(conn, "index.html")
  end
end
