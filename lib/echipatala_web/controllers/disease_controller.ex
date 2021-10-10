defmodule EchipatalaWeb.DiseaseController do
  use EchipatalaWeb, :controller

  alias Echipatala.Diseases
  alias Echipatala.Diseases.Disease

  def index(conn, _params) do
    tbl_disease = Diseases.list_tbl_disease()
    render(conn, "index.html", tbl_disease: tbl_disease)
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
end
