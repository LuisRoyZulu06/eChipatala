defmodule EchipatalaWeb.SymptomController do
  use EchipatalaWeb, :controller

  alias Echipatala.Diseases
  alias Echipatala.Diseases.Symptom
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


  def symptom(conn, params) do
    {draw, start, length, search_params} = Pages.search_options(params)
    json(conn, Pages.display(draw, Diseases.list_tbl_symptoms(
      search_params,
      start,
      length
    )))
  end


  def create_symptom(conn, params) do
    IO.inspect "=========================================="
    IO.inspect params

    case Diseases.get_symptom_by_name(params["name"]) do
      nil ->
        Ecto.Multi.new()
        |> Ecto.Multi.insert(:symptom, Symptom.changeset(%Symptom{}, params))
        |> Repo.transaction()
        |> case do
          {:ok, symptom} ->
            conn
            |> put_flash(:info, "The Symptom #{params["name"]} has been created successfully")
            |> redirect(to: Routes.symptom_path(conn, :index))

          {:error, _failed_operation, failed_value, _changes_so_far} ->
            reason = traverse_errors(failed_value.errors) |> List.first()

            conn
            |> put_flash(:error, reason)
            |> redirect(to: "#{redirect_to_back(conn)}")
        end
      disease ->
        conn
        |> put_flash(:error, "Symptom #{params["name"]} already exists.")
        |> redirect(to: "#{redirect_to_back(conn)}")
    end
  end

def index(conn, _params) do
    tbl_symptom = Diseases.list_tbl_symptom()
    render(conn, "index.html", tbl_symptom: tbl_symptom)
  end

  def new(conn, _params) do
    changeset = Diseases.change_symptom(%Symptom{})
    render(conn, "new.html", changeset: changeset)
  end

  def create(conn, %{"symptom" => symptom_params}) do
    case Diseases.create_symptom(symptom_params) do
      {:ok, symptom} ->
        conn
        |> put_flash(:info, "Symptom created successfully.")
        |> redirect(to: Routes.symptom_path(conn, :show, symptom))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "new.html", changeset: changeset)
    end
  end

  def show(conn, %{"id" => id}) do
    symptom = Diseases.get_symptom!(id)
    render(conn, "show.html", symptom: symptom)
  end

  def edit(conn, %{"id" => id}) do
    symptom = Diseases.get_symptom!(id)
    changeset = Diseases.change_symptom(symptom)
    render(conn, "edit.html", symptom: symptom, changeset: changeset)
  end

  def update(conn, %{"id" => id, "symptom" => symptom_params}) do
    symptom = Diseases.get_symptom!(id)

    case Diseases.update_symptom(symptom, symptom_params) do
      {:ok, symptom} ->
        conn
        |> put_flash(:info, "Symptom updated successfully.")
        |> redirect(to: Routes.symptom_path(conn, :show, symptom))

      {:error, %Ecto.Changeset{} = changeset} ->
        render(conn, "edit.html", symptom: symptom, changeset: changeset)
    end
  end

  def delete(conn, %{"id" => id}) do
    symptom = Diseases.get_symptom!(id)
    {:ok, _symptom} = Diseases.delete_symptom(symptom)

    conn
    |> put_flash(:info, "Symptom deleted successfully.")
    |> redirect(to: Routes.symptom_path(conn, :index))
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
