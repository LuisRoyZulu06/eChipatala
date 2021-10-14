defmodule Echipatala.Pharmacy.Stock do
  use Ecto.Schema
  import Ecto.Changeset

  schema "stock" do
    field :name, :string
    field :description, :string
    field :price, :decimal
    field :pharmacy_id, :integer
    field :creator_id, :string
    field :qty, :integer

    timestamps()
  end

  @doc false
  def changeset(institution_details, attrs) do
    institution_details
    |> cast(attrs, [:name, :qty, :description, :price, :creator_id, :pharmacy_id])
    |> validate_required([:name, :qty, :description, :price, :pharmacy_id, :creator_id])
  end
end
