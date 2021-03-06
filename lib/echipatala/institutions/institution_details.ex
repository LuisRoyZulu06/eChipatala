defmodule Echipatala.Institutions.InstitutionDetails do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_institutions" do
    field :address, :string
    field :creator_id, :string
    field :email, :string
    field :institution_type, :string
    field :name, :string
    field :tel, :string
    field :logo, Echipatala.LogoUploader.Type

    timestamps()
  end

  @doc false
  def changeset(institution_details, attrs) do
    institution_details
    |> cast(attrs, [:name, :institution_type, :tel, :email, :address, :creator_id, :logo])
    |> validate_required([:name, :institution_type, :tel, :email, :address, :creator_id])
  end
end
