defmodule Echipatala.ServicesFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Echipatala.Services` context.
  """

  @doc """
  Generate a service.
  """
  def service_fixture(attrs \\ %{}) do
    {:ok, service} =
      attrs
      |> Enum.into(%{
        consult_fee: "some consult_fee",
        descript: "some descript",
        has_subs: "some has_subs",
        inst_id: "some inst_id",
        is_sub: "some is_sub",
        maker_id: "some maker_id",
        name: "some name",
        parent_id: "some parent_id",
        status: "some status"
      })
      |> Echipatala.Services.create_service()

    service
  end
end
