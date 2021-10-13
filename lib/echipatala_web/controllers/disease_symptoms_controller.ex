defmodule EchipatalaWeb.DiseaseSymptomController do
  use EchipatalaWeb, :controller

  alias Echipatala.Diseases
  alias Echipatala.Diseases.DiseaseSymptom
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
    diseases = Diseases.list_tbl_diseases()
    symptoms = Diseases.list_tbl_symptoms()
    render(conn, "index.html", diseases: diseases, symptoms: symptoms )
  end


  def disease_symptom(conn, params) do
    {draw, start, length, search_params} = Pages.search_options(params)
    json(conn, Pages.display(draw, Diseases.list_tbl_disease_symptoms(
      search_params,
      start,
      length
    )))
  end


  def create_disease_symptom(conn, params) do
    IO.inspect "=========================================="
    IO.inspect params
    case Diseases.get_disease_symptom_by_ids(params) do
      nil ->
        Ecto.Multi.new()
        |> Ecto.Multi.insert(:disease, DiseaseSymptom.changeset(%DiseaseSymptom{}, params))
        |> Repo.transaction()
        |> case do
          {:ok, disease} ->
            conn
            |> put_flash(:info, "The disease has been mapped successfully")
            |> redirect(to: Routes.disease_symptom_path(conn, :index))

          {:error, _failed_operation, failed_value, _changes_so_far} ->
            reason = traverse_errors(failed_value.errors) |> List.first()

            conn
            |> put_flash(:error, reason)
            |> redirect(to: "#{redirect_to_back(conn)}")
        end
      dis_symp ->
        conn
        |> put_flash(:error, "Disease Sympom already exists.")
        |> redirect(to: "#{redirect_to_back(conn)}")
    end
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
