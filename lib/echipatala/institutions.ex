defmodule Echipatala.Institutions do
  @moduledoc """
  The Institutions context.
  """

  import Ecto.Query, warn: false
  alias Echipatala.Repo

  alias Echipatala.Institutions.InstitutionDetails

  @doc """
  Returns the list of tbl_institutions.

  ## Examples

      iex> list_tbl_institutions()
      [%InstitutionDetails{}, ...]

  """
  def list_institutions do
    Repo.all(InstitutionDetails)
  end

  @doc """
  Gets a single institution_details.

  Raises `Ecto.NoResultsError` if the Institution details does not exist.

  ## Examples

      iex> get_institution_details!(123)
      %InstitutionDetails{}

      iex> get_institution_details!(456)
      ** (Ecto.NoResultsError)

  """
  def get_institution_details!(id), do: Repo.get!(InstitutionDetails, id)

  @doc """
  Creates a institution_details.

  ## Examples

      iex> create_institution_details(%{field: value})
      {:ok, %InstitutionDetails{}}

      iex> create_institution_details(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_institution_details(attrs \\ %{}) do
    %InstitutionDetails{}
    |> InstitutionDetails.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a institution_details.

  ## Examples

      iex> update_institution_details(institution_details, %{field: new_value})
      {:ok, %InstitutionDetails{}}

      iex> update_institution_details(institution_details, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_institution_details(%InstitutionDetails{} = institution_details, attrs) do
    institution_details
    |> InstitutionDetails.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a institution_details.

  ## Examples

      iex> delete_institution_details(institution_details)
      {:ok, %InstitutionDetails{}}

      iex> delete_institution_details(institution_details)
      {:error, %Ecto.Changeset{}}

  """
  def delete_institution_details(%InstitutionDetails{} = institution_details) do
    Repo.delete(institution_details)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking institution_details changes.

  ## Examples

      iex> change_institution_details(institution_details)
      %Ecto.Changeset{data: %InstitutionDetails{}}

  """
  def change_institution_details(%InstitutionDetails{} = institution_details, attrs \\ %{}) do
    InstitutionDetails.changeset(institution_details, attrs)
  end
end
