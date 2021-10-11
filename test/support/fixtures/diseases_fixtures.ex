defmodule Echipatala.DiseasesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Echipatala.Diseases` context.
  """

  @doc """
  Generate a disease.
  """
  def disease_fixture(attrs \\ %{}) do
    {:ok, disease} =
      attrs
      |> Enum.into(%{
        maker_id: "some maker_id",
        name: "some name"
      })
      |> Echipatala.Diseases.create_disease()

    disease
  end

  @doc """
  Generate a symptom.
  """
  def symptom_fixture(attrs \\ %{}) do
    {:ok, symptom} =
      attrs
      |> Enum.into(%{
        category: "some category",
        maker_id: "some maker_id",
        name: "some name"
      })
      |> Echipatala.Diseases.create_symptom()

    symptom
  end

  @doc """
  Generate a disease_symptom.
  """
  def disease_symptom_fixture(attrs \\ %{}) do
    {:ok, disease_symptom} =
      attrs
      |> Enum.into(%{
        disease_id: "some disease_id",
        percentage: "some percentage",
        symptom_id: "some symptom_id"
      })
      |> Echipatala.Diseases.create_disease_symptom()

    disease_symptom
  end
end
