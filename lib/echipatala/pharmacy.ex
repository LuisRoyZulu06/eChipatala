defmodule Echipatala.Pharmacy do
  @moduledoc """
  The Institutions context.
  """

  import Ecto.Query, warn: false
  alias Echipatala.Repo

  alias Echipatala.Pharmacy.PharmacySchema


  def list_pharmacies,  do: Repo.all(PharmacySchema)



  def get_pharmacy!(id), do: Repo.get!(PharmacySchema, id)




  def create_pharmacy(attrs \\ %{}) do
    %PharmacySchema{}
    |> PharmacySchema.changeset(attrs)
    |> Repo.insert()
  end


  def update_pharmacy(%PharmacySchema{} = institution_details, attrs) do
    institution_details
    |> PharmacySchema.changeset(attrs)
    |> Repo.update()
  end


  def delete_pharmacy(%PharmacySchema{} = institution_details) do
    Repo.delete(institution_details)
  end


  def change_pharmacy(%PharmacySchema{} = institution_details, attrs \\ %{}) do
    PharmacySchema.changeset(institution_details, attrs)
  end
end
