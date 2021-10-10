defmodule Echipatala.Diseases do
  @moduledoc """
  The Diseases context.
  """

  import Ecto.Query, warn: false
  alias Echipatala.Repo

  alias Echipatala.Diseases.Disease

  @doc """
  Returns the list of tbl_disease.

  ## Examples

      iex> list_tbl_disease()
      [%Disease{}, ...]

  """
  def list_tbl_disease do
    Repo.all(Disease)
  end

  @doc """
  Gets a single disease.

  Raises `Ecto.NoResultsError` if the Disease does not exist.

  ## Examples

      iex> get_disease!(123)
      %Disease{}

      iex> get_disease!(456)
      ** (Ecto.NoResultsError)

  """
  def get_disease!(id), do: Repo.get!(Disease, id)

  @doc """
  Creates a disease.

  ## Examples

      iex> create_disease(%{field: value})
      {:ok, %Disease{}}

      iex> create_disease(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_disease(attrs \\ %{}) do
    %Disease{}
    |> Disease.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a disease.

  ## Examples

      iex> update_disease(disease, %{field: new_value})
      {:ok, %Disease{}}

      iex> update_disease(disease, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_disease(%Disease{} = disease, attrs) do
    disease
    |> Disease.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a disease.

  ## Examples

      iex> delete_disease(disease)
      {:ok, %Disease{}}

      iex> delete_disease(disease)
      {:error, %Ecto.Changeset{}}

  """
  def delete_disease(%Disease{} = disease) do
    Repo.delete(disease)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking disease changes.

  ## Examples

      iex> change_disease(disease)
      %Ecto.Changeset{data: %Disease{}}

  """
  def change_disease(%Disease{} = disease, attrs \\ %{}) do
    Disease.changeset(disease, attrs)
  end

  alias Echipatala.Diseases.Symptom

  @doc """
  Returns the list of tbl_symptom.

  ## Examples

      iex> list_tbl_symptom()
      [%Symptom{}, ...]

  """
  def list_tbl_symptom do
    Repo.all(Symptom)
  end

  @doc """
  Gets a single symptom.

  Raises `Ecto.NoResultsError` if the Symptom does not exist.

  ## Examples

      iex> get_symptom!(123)
      %Symptom{}

      iex> get_symptom!(456)
      ** (Ecto.NoResultsError)

  """
  def get_symptom!(id), do: Repo.get!(Symptom, id)

  @doc """
  Creates a symptom.

  ## Examples

      iex> create_symptom(%{field: value})
      {:ok, %Symptom{}}

      iex> create_symptom(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_symptom(attrs \\ %{}) do
    %Symptom{}
    |> Symptom.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a symptom.

  ## Examples

      iex> update_symptom(symptom, %{field: new_value})
      {:ok, %Symptom{}}

      iex> update_symptom(symptom, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_symptom(%Symptom{} = symptom, attrs) do
    symptom
    |> Symptom.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a symptom.

  ## Examples

      iex> delete_symptom(symptom)
      {:ok, %Symptom{}}

      iex> delete_symptom(symptom)
      {:error, %Ecto.Changeset{}}

  """
  def delete_symptom(%Symptom{} = symptom) do
    Repo.delete(symptom)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking symptom changes.

  ## Examples

      iex> change_symptom(symptom)
      %Ecto.Changeset{data: %Symptom{}}

  """
  def change_symptom(%Symptom{} = symptom, attrs \\ %{}) do
    Symptom.changeset(symptom, attrs)
  end

  alias Echipatala.Diseases.DiseaseSymptom

  @doc """
  Returns the list of tbl_disease_symptom.

  ## Examples

      iex> list_tbl_disease_symptom()
      [%DiseaseSymptom{}, ...]

  """
  def list_tbl_disease_symptom do
    Repo.all(DiseaseSymptom)
  end

  @doc """
  Gets a single disease_symptom.

  Raises `Ecto.NoResultsError` if the Disease symptom does not exist.

  ## Examples

      iex> get_disease_symptom!(123)
      %DiseaseSymptom{}

      iex> get_disease_symptom!(456)
      ** (Ecto.NoResultsError)

  """
  def get_disease_symptom!(id), do: Repo.get!(DiseaseSymptom, id)

  @doc """
  Creates a disease_symptom.

  ## Examples

      iex> create_disease_symptom(%{field: value})
      {:ok, %DiseaseSymptom{}}

      iex> create_disease_symptom(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_disease_symptom(attrs \\ %{}) do
    %DiseaseSymptom{}
    |> DiseaseSymptom.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a disease_symptom.

  ## Examples

      iex> update_disease_symptom(disease_symptom, %{field: new_value})
      {:ok, %DiseaseSymptom{}}

      iex> update_disease_symptom(disease_symptom, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_disease_symptom(%DiseaseSymptom{} = disease_symptom, attrs) do
    disease_symptom
    |> DiseaseSymptom.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a disease_symptom.

  ## Examples

      iex> delete_disease_symptom(disease_symptom)
      {:ok, %DiseaseSymptom{}}

      iex> delete_disease_symptom(disease_symptom)
      {:error, %Ecto.Changeset{}}

  """
  def delete_disease_symptom(%DiseaseSymptom{} = disease_symptom) do
    Repo.delete(disease_symptom)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking disease_symptom changes.

  ## Examples

      iex> change_disease_symptom(disease_symptom)
      %Ecto.Changeset{data: %DiseaseSymptom{}}

  """
  def change_disease_symptom(%DiseaseSymptom{} = disease_symptom, attrs \\ %{}) do
    DiseaseSymptom.changeset(disease_symptom, attrs)
  end
end
