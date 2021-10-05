defmodule Echipatala.NotificationsFixtures do
  @moduledoc """
  This module defines test helpers for creating
  entities via the `Echipatala.Notifications` context.
  """

  @doc """
  Generate a email.
  """
  def email_fixture(attrs \\ %{}) do
    {:ok, email} =
      attrs
      |> Enum.into(%{
        attempts: "some attempts",
        email_body: "some email_body",
        receipient_email_address: "some receipient_email_address",
        sender_email_address: "some sender_email_address",
        sender_name: "some sender_name",
        status: "some status",
        subject: "some subject"
      })
      |> Echipatala.Notifications.create_email()

    email
  end

  @doc """
  Generate a sms.
  """
  def sms_fixture(attrs \\ %{}) do
    {:ok, sms} =
      attrs
      |> Enum.into(%{
        date_sent: "some date_sent",
        mobile: "some mobile",
        msg_count: "some msg_count",
        sms: "some sms",
        status: "some status",
        type: "some type"
      })
      |> Echipatala.Notifications.create_sms()

    sms
  end
end
