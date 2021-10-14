defmodule EchipatalaWeb.PharmacyController do
  use EchipatalaWeb, :controller

  alias Echipatala.{Pharmacy, Accounts}

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

  def create(conn, %{"create_pharmacy_user" => request}) do

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

  def update(conn, %{"id" => id, "update_pharmacy" => params}) do
    pharmacy = Pharmacy.get_pharmacy!(id)
    case Pharmacy.update_pharmacy(pharmacy, params) do
      {:ok, _} ->
        conn
        |> put_flash(:info, "Pharmacy updated successfully!")
        |> redirect(to: Routes.pharmacy_path(conn, :details, pharmacy))
      {:error, _} ->
        conn
        |> put_flash(:error, "Error occured!")
        |> redirect(to: Routes.pharmacy_path(conn, :details, pharmacy))

    end
  end


  def management(conn, _) do
    result = Pharmacy.list_pharmacies()
    render(conn, "management.html", result: result)
  end


  def details(conn, %{"id" => id}) do
    staff_details = Accounts.get_user_pharmacy(id)
    institution_details = Pharmacy.get_pharmacy!(id)
    render(conn, "details.html",
      staff_details: staff_details,
      institution_details: institution_details)
  end




end
