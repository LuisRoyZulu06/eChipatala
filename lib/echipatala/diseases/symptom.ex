defmodule Echipatala.Diseases.Symptom do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_symptom" do
    field :category, :string
    field :maker_id, :integer
    field :name, :string

    timestamps()
  end

  @doc false
  def changeset(symptom, attrs) do
    symptom
    |> cast(attrs, [:name, :category, :maker_id])
    |> validate_required([:name, :category, :maker_id])
  end
end
