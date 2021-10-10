defmodule EchipatalaWeb.SymptomController do
  use EchipatalaWeb, :controller

  alias Echipatala.Diseases
  alias Echipatala.Diseases.Symptom

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
end
