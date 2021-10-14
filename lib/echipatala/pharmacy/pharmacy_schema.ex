defmodule Echipatala.Pharmacy.PharmacySchema do
  use Ecto.Schema
  import Ecto.Changeset

  schema "pharmacy" do
    field :address, :string
    field :creator_id, :string
    field :email, :string
    field :name, :string
    field :tel, :string
    field :logo, Echipatala.LogoUploader.Type

    timestamps()
  end

  @doc false
  def changeset(institution_details, attrs) do
    institution_details
    |> cast(attrs, [:name, :tel, :email, :address, :creator_id, :logo])
    |> validate_required([:name, :tel, :email, :address, :creator_id])
  end
end
