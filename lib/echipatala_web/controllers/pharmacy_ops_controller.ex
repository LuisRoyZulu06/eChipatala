defmodule EchipatalaWeb.PharmacyOpsController do
  use EchipatalaWeb, :controller

  alias Echipatala.{Pharmacy, Accounts}

  def dashboard(conn, _) do
    render(conn, "dashboard.html")
  end

  def stock(conn, _params) do
    user = conn.assigns.user
    IO.inspect(conn)
    result = Pharmacy.list_stock(user)
    render(conn, "stock.html", result: result)
  end

  def create_stock(conn, %{"add_stock" => stock}) do
    case Pharmacy.create_stock(stock) do
      {:ok, _} ->
        conn
        |> put_flash(:info, "Stock added successfully!")
        |> redirect(to: Routes.pharmacy_ops_path(conn, :stock))
      {:error, _} ->
        conn
        |> put_flash(:error, "Error occured!")
        |> redirect(to: Routes.pharmacy_ops_path(conn, :stock))

    end
  end

  def inventory(conn, _params) do
    render(conn, "inventory.html")
  end

  def orders(conn, _params) do
    render(conn, "orders.html")
  end



end
