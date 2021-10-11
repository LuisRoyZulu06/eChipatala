defmodule Echipatala.Diseases.DiseaseSymptom do
  use Ecto.Schema
  import Ecto.Changeset

  schema "tbl_disease_symptom" do
    field :percentage, :integer
    belongs_to :symptom, Echipatala.Diseases.Symptom, foreign_key: :symptom_id, type: :id
    belongs_to :disease, Echipatala.Diseases.Disease, foreign_key: :disease_id, type: :id

    timestamps()
  end

  @doc false
  def changeset(disease_symptom, attrs) do
    disease_symptom
    |> cast(attrs, [:disease_id, :symptom_id, :percentage])
    |> validate_required([:disease_id, :symptom_id, :percentage])
  end
end
