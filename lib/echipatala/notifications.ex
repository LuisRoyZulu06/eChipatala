defmodule Echipatala.Notifications do
  @moduledoc """
  The Notifications context.
  """

  import Ecto.Query, warn: false
  alias Echipatala.Repo

  alias Echipatala.Notifications.Email

  @doc """
  Returns the list of tbl_email.

  ## Examples

      iex> list_tbl_email()
      [%Email{}, ...]

  """
  def list_tbl_email do
    Repo.all(Email)
  end



  def list_all_emails(conn, search_params, page, size) do
    Email
    |> where([c], c.status !="")
    |> handle_email_filter(search_params)
    |> order_by(desc: :inserted_at)
    |> compose_email_select()
    |> Repo.paginate(page: page, page_size: size)
  end

  defp handle_email_filter(query, params) do
    Enum.reduce(params, query, fn
      {"isearch", value}, query when byte_size(value) > 0 ->
        user_isearch_filter(query, sanitize_term(value))

      {"email", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("lower(?) LIKE lower(?)", a.receipient_email_address, ^sanitize_term(value)))

      {"status", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("lower(?) LIKE lower(?)", a.status, ^sanitize_term(value)))

      {"from", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("CAST(? AS DATE) >= ?", a.inserted_at, ^value))

      {"to", value}, query when byte_size(value) > 0 ->
        where(query, [a], fragment("CAST(? AS DATE) <= ?", a.inserted_at, ^value))



      {_, _}, query ->
        # Not a where parameter
        query
    end)
  end

  defp user_isearch_filter(query, search_term) do
       where(
         query,
         [a],
         fragment("lower(?) LIKE lower(?)", a.status, ^search_term) or
         fragment("lower(?) LIKE lower(?)", a.receipient_email_address, ^search_term)
       )
    end

    defp sanitize_term(term), do: "%#{String.replace(term, "%", "\\%")}%"


  defp compose_email_select(query) do
    query
    |> select(
      [t],
      map(t, [
        :id,
        :subject,
        :sender_email_address,
        :sender_name,
        :email_body,
        :receipient_email_address,
        :status,
        :inserted_at,
        :updated_at
      ])
    )
  end

  @doc """
  Gets a single email.

  Raises `Ecto.NoResultsError` if the Email does not exist.

  ## Examples

      iex> get_email!(123)
      %Email{}

      iex> get_email!(456)
      ** (Ecto.NoResultsError)

  """
  def get_email!(id), do: Repo.get!(Email, id)

  @doc """
  Creates a email.

  ## Examples

      iex> create_email(%{field: value})
      {:ok, %Email{}}

      iex> create_email(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_email(attrs \\ %{}) do
    %Email{}
    |> Email.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a email.

  ## Examples

      iex> update_email(email, %{field: new_value})
      {:ok, %Email{}}

      iex> update_email(email, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_email(%Email{} = email, attrs) do
    email
    |> Email.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a email.

  ## Examples

      iex> delete_email(email)
      {:ok, %Email{}}

      iex> delete_email(email)
      {:error, %Ecto.Changeset{}}

  """
  def delete_email(%Email{} = email) do
    Repo.delete(email)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking email changes.

  ## Examples

      iex> change_email(email)
      %Ecto.Changeset{data: %Email{}}

  """
  def change_email(%Email{} = email, attrs \\ %{}) do
    Email.changeset(email, attrs)
  end

  alias Echipatala.Notifications.Sms

  @doc """
  Returns the list of tbl_sms.

  ## Examples

      iex> list_tbl_sms()
      [%Sms{}, ...]

  """
  def list_tbl_sms do
    Repo.all(Sms)
  end

  @doc """
  Gets a single sms.

  Raises `Ecto.NoResultsError` if the Sms does not exist.

  ## Examples

      iex> get_sms!(123)
      %Sms{}

      iex> get_sms!(456)
      ** (Ecto.NoResultsError)

  """
  def get_sms!(id), do: Repo.get!(Sms, id)

  @doc """
  Creates a sms.

  ## Examples

      iex> create_sms(%{field: value})
      {:ok, %Sms{}}

      iex> create_sms(%{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def create_sms(attrs \\ %{}) do
    %Sms{}
    |> Sms.changeset(attrs)
    |> Repo.insert()
  end

  @doc """
  Updates a sms.

  ## Examples

      iex> update_sms(sms, %{field: new_value})
      {:ok, %Sms{}}

      iex> update_sms(sms, %{field: bad_value})
      {:error, %Ecto.Changeset{}}

  """
  def update_sms(%Sms{} = sms, attrs) do
    sms
    |> Sms.changeset(attrs)
    |> Repo.update()
  end

  @doc """
  Deletes a sms.

  ## Examples

      iex> delete_sms(sms)
      {:ok, %Sms{}}

      iex> delete_sms(sms)
      {:error, %Ecto.Changeset{}}

  """
  def delete_sms(%Sms{} = sms) do
    Repo.delete(sms)
  end

  @doc """
  Returns an `%Ecto.Changeset{}` for tracking sms changes.

  ## Examples

      iex> change_sms(sms)
      %Ecto.Changeset{data: %Sms{}}

  """
  def change_sms(%Sms{} = sms, attrs \\ %{}) do
    Sms.changeset(sms, attrs)
  end
end
