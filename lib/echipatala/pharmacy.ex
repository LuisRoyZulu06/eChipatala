defmodule Echipatala.Pharmacy do
  @moduledoc """
  The Institutions context.
  """

  import Ecto.Query, warn: false
  alias Echipatala.Repo

  alias Echipatala.Pharmacy.{PharmacySchema, Stock}


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

#   ================================= STOCK ===========================

  def list_stock(user) do
    Repo.all(from a in Stock, where: a.pharmacy_id == type(^user.pharmacy_id, :integer))
  end

  def create_stock(attrs \\ %{}) do
    %Stock{}
    |> Stock.changeset(attrs)
    |> Repo.insert()
  end

  def update_stock(%Stock{} = stock, attrs) do
    stock
    |> Stock.changeset(attrs)
    |> Repo.update()
  end


  def delete_stock(%Stock{} = stock) do
    Repo.delete(stock)
  end






end
