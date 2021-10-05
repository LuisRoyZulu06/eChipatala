defmodule Echipatala.AccountsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Echipatala.Accounts` context.
  """

  @doc """
  Generate a user.
  """
  def user_fixture(attrs \\ %{}) do
    {:ok, user} =
      attrs
      |> Enum.into(%{
        auto_password: "some auto_password",
        creator_id: "some creator_id",
        email: "some email",
        gender: "some gender",
        name: "some name",
        password: "some password",
        phone: "some phone",
        status: "some status",
        user_role: "some user_role",
        user_type: 42,
        username: "some username"
      })
      |> Echipatala.Accounts.create_user()

    user
  end
end
