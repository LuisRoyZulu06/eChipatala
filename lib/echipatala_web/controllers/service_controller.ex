defmodule EchipatalaWeb.ServiceController do
  use EchipatalaWeb, :controller

  alias Echipatala.Services
  alias Echipatala.Services.Service

  def index(conn, _params) do
    services = Services.institution_services("1")
    render(conn, "index.html", services: services)
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

  def sub_services(conn, %{"id"=> id}) do
    subs = Services.get_sub_services(id)
    render(conn, "sub_services.html", subs: subs)
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
