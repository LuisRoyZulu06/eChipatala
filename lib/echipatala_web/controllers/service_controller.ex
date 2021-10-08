defmodule EchipatalaWeb.ServiceController do
  use EchipatalaWeb, :controller

  alias Echipatala.Services
  alias Echipatala.Services.Service

  def index(conn, _params) do
    tbl_service = Services.list_tbl_service()
    render(conn, "index.html", tbl_service: tbl_service)
  end

  def create(conn, params) do
    case Services.create_service(params) do
      {:ok, _service} ->
        conn
        |> put_flash(:info, "Service created successfully.")
        |> redirect(to: Routes.service_path(conn, :index))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end


  def update(conn, %{"id" => id}=params) do
    service = Services.get_service!(id)

    case Services.update_service(service, params) do
      {:ok, service} ->
        conn
        |> put_flash(:info, "Service updated successfully.")
        |> redirect(to: Routes.service_path(conn, :show, service))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", service: service, changeset: changeset)
    end
  end

end
