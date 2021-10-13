defmodule EchipatalaWeb.DiseaseController do
  use EchipatalaWeb, :controller

  alias Echipatala.Diseases
  alias Echipatala.Diseases.Disease
  alias Echipatala.Pages
  alias Echipatala.Repo

  plug(
    EchipatalaWeb.Plugs.RequireAuth
    when action in [
           :index,
           :disease
         ]
  )


  def index(conn, _params) do
    render(conn, "index.html")
  end


  def disease(conn, params) do
    {draw, start, length, search_params} = Pages.search_options(params)
    json(conn, Pages.display(draw, Diseases.list_tbl_disease(
      search_params,
      start,
      length
    )))
  end


  def create_disease(conn, params) do
    IO.inspect "=========================================="
    IO.inspect params

    case Diseases.get_disease_by_name(params["name"]) do
      nil ->
        Ecto.Multi.new()
        |> Ecto.Multi.insert(:disease, Disease.changeset(%Disease{}, params))
        |> Repo.transaction()
        |> case do
          {:ok, disease} ->
            conn
            |> put_flash(:info, "The disease name of #{params["name"]} has been created successfully")
            |> redirect(to: Routes.disease_path(conn, :index))

          {:error, _failed_operation, failed_value, _changes_so_far} ->
            reason = traverse_errors(failed_value.errors) |> List.first()

            conn
            |> put_flash(:error, reason)
            |> redirect(to: "#{redirect_to_back(conn)}")
        end
      disease ->
        conn
        |> put_flash(:error, "Disease with name #{params["name"]} already exists.")
        |> redirect(to: "#{redirect_to_back(conn)}")
    end
  end

  def new(conn, _params) do
    changeset = Diseases.change_disease(%Disease{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"disease" => disease_params}) do
    case Diseases.create_disease(disease_params) do
      {:ok, disease} ->
        conn
        |> put_flash(:info, "Disease created successfully.")
        |> redirect(to: Routes.disease_path(conn, :show, disease))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    disease = Diseases.get_disease!(id)
    render(conn, "show.html", disease: disease)
  end

  def edit(conn, %{"id" => id}) do
    disease = Diseases.get_disease!(id)
    changeset = Diseases.change_disease(disease)
    render(conn, "edit.html", disease: disease, changeset: changeset)
  end

  def update(conn, %{"id" => id, "disease" => disease_params}) do
    disease = Diseases.get_disease!(id)

    case Diseases.update_disease(disease, disease_params) do
      {:ok, disease} ->
        conn
        |> put_flash(:info, "Disease updated successfully.")
        |> redirect(to: Routes.disease_path(conn, :show, disease))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", disease: disease, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    disease = Diseases.get_disease!(id)
    {:ok, _disease} = Diseases.delete_disease(disease)

    conn
    |> put_flash(:info, "Disease deleted successfully.")
    |> redirect(to: Routes.disease_path(conn, :index))
  end


  def traverse_errors(errors) do
    for {key, {msg, _opts}} <- errors, do: "#{key} #{msg}"
  end

  # --/ Help function to redirect to requesting page on fuction being requested by many.
  def redirect_to_back(conn) do
    case List.keyfind(conn.req_headers, "referer", 0) do
      {"referer", referer} ->
        referer
        |> URI.parse()
        |> Map.get(:path)

      nil ->
        conn.request_path
    end
  end
end
