defmodule EchipatalaWeb.PharmacyController do
  use EchipatalaWeb, :controller

  alias Echipatala.Pharmacy

  def index(conn, _params) do
    render(conn, "index.html")
  end

  def create(conn, %{"create_pharmacy" => request}) do

    case Pharmacy.create_pharmacy(request) do
      {:ok, _} ->
        conn
        |> put_flash(:info, "Pharmacy Added Successfully!")
        |> redirect(to: Routes.pharmacy_path(conn, :management))
      {:error, _} ->
        conn
        |> put_flash(:error, "Error Occured!!")
        |> redirect(to: Routes.pharmacy_path(conn, :management))

    end

    render(conn, "management.html")
  end

  def management(conn, _) do
    result = Pharmacy.list_pharmacies()
    render(conn, "management.html", result: result)
  end


end
