defmodule Echipatala.InstitutionsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Echipatala.Institutions` context.
  """

  @doc """
  Generate a institution_details.
  """
  def institution_details_fixture(attrs \\ %{}) do
    {:ok, institution_details} =
      attrs
      |> Enum.into(%{
        address: "some address",
        creator_id: "some creator_id",
        email: "some email",
        institution_type: "some institution_type",
        name: "some name",
        system_user_id: "some system_user_id",
        tel: "some tel"
      })
      |> Echipatala.Institutions.create_institution_details()

    institution_details
  end
end
