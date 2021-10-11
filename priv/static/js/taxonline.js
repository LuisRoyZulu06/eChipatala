$(document).ready(function(){
    $('#fetch_prn').on('click', function () {

        if ($('#prn').val().trim() == '') {
            Swal.fire({
                title: 'Please check required fields',
                text: "Note: Missing PRN",
            });
            return;
        }

        if ($('#prn').val().trim().length != '12') {
            Swal.fire({
                title: 'Please check required fields',
                text: "Note: Invalid PRN",
            });
            return;
        }

        $("#pre-loader-1").fadeIn(300);

        UJS.xhr("/Teller/Taxonline/prn_details", "POST", {
            type: 'json',
            data: { prn: $('#prn').val(), _csrf_token: $('#csrf').val() },
            success: function (xhr) {
                $("#pre-loader-1").fadeOut(300);
            },
            error: function(xhr){
                $("#pre-loader-1").fadeOut(300);
            Swal.fire({
                title: 'Error',
                text: "Note: Application Error Occured",
            });
            return;}
        });


        document.addEventListener('ajax:success', function (e) {
            var prn = JSON.parse(e.data.xhr.response);

            if (prn.data.status_code != "SUCCESS") {
                Swal.fire({
                    title: prn.status,
                    type: "warning",
                });
            } else {
                console.log(prn.data.charge);
                $("#tr").empty();
                $('#submit').empty();
                document.getElementById('welcomeDiv').style.display = "block";
                $("#tr").append("<td id='tpin' >" + prn.data.prn.tpin + "</td>");
                $("#tr").append("<td id='taxPayer' >" + prn.data.prn.taxPayerName + "</td>");
                $("#tr").append("<td id='prn' >" + prn.data.prn.prn + "</td>");
                $("#tr").append("<td id='prnDate' >" + prn.data.prn.prnDate + "</td>");
                $("#tr").append("<td id='prnExpDate' >" + prn.data.prn.prnExpiryDate + "</td>");
                $("#tr").append("<td id='amount' >" + prn.data.prn.amount + "</td>");
                $("#tr").append("<td>ACTIVE</td>");

                $('#submit').append("<input type='hidden' name='tpin' value='" + prn.data.prn.tpin + "'/>");
                $('#submit').append("<input type='hidden' name='taxPayer' value='" + prn.data.prn.taxPayerName + "'/>");
                $('#submit').append("<input type='hidden' name='prn' value='" + prn.data.prn.prn + "'/>");
                $('#submit').append("<input type='hidden' name='prnDate' value='" + prn.data.prn.prnDate + "'/>");
                $('#submit').append("<input type='hidden' name='prnExpDate' value='" + prn.data.prn.prnExpiryDate + "'/>");
                $('#submit').append("<input type='hidden' name='amount' value='" + prn.data.prn.amount + "'/>");
                $('#submit').append("<input type='hidden' name='charge' value='" + prn.data.charge + "'/>");
            }

        });

    });

    $('#post_prn').on('click', function(){
        $("#pre-loader-1").fadeIn(300);
    });

    $('#proceed').on('click', function () {

        if (($('#bank_ref').val().trim() == '') ||
            ($('#company_name').val().trim() == '') ||
            ($('#payer_name').val().trim() == '') ||
            ($('#nrc').val().trim() == '') ||
            ($('#mobile').val().trim() == '')) {
            Swal.fire({
                title: 'Please check all required fields',
                type: "warning"
            });
            return;
        } else {
            $('#payment_details').append("<input type='hidden' name='nrc' value='" + $('#nrc').val().trim() + "'>");
            $('#payment_details').append("<input type='hidden' name='payer_name' value='" + $('#payer_name').val().trim() + "'>")
            $('#payment_details').append("<input type='hidden' name='bank_ref' value='" + $('#bank_ref').val().trim() + "'>")
            $('#payment_details').append("<input type='hidden' name='mobile' value='" + $('#mobile').val().trim() + "'>")
            $('#payment_details').append("<input type='hidden' name='company_name' value='" + $('#company_name').val().trim() + "'>")
            $('#payment_details').append("<input type='hidden' name='email' value='" + $('#email').val().trim() + "'>")
            $('#payment_details').append("<input type='hidden' name='address' value='" + $('#address').val().trim() + "'>")
            $('#confirmation').modal("show");
        }

    });


    //display submission result
    function domt_select_acc_modal(result){
        var txn = result.prn
        var txn_amount =  parseFloat(txn.amount) 
        var accounts = result.accounts
        var modal = $('#domt_payment')
        modal.find('.modal-body #tpin').text(txn.tpin);
        modal.find('.modal-body #prn').text(txn.prn);
        modal.find('.modal-body #payment_prn').val(txn.prn);
        modal.find('.modal-body #amount').text(txn_amount);
        modal.find('.modal-body #charge').text(result.trans_fee);
        $('#accounts').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: accounts,
            columns: [
            {"data": "account"},
            {"data": "name"},
            {"data": "balance"},
            {
                "data": "balance",
                "render": function (balance, type, row ) {
                                            
                      returns= '<input type="radio" name="dr_acc" value="'+row.account+'">';
                      returns +='<input type="hidden" id="txn_amount" name="amount" value="'+txn_amount+'">';
                      returns +='<input type="hidden" id="acc_bal" name="acc_bal" value="'+balance+'">';

                      return returns;
                                  
                }
            }
            ]
        });
        $('#domt_payment').modal('show');
    }

    //------------ RETAIL NAPSA PAYMENT---------
    $('.domt_pay').on( 'click', function (event) {

        var prn_id =  $(event.target).attr("data-prn");
        $("#pre-loader-1").fadeIn(300);
        $.ajax({
            url: "/ZRA/Domt/payment/confirmation",
            type: 'POST',
            data: {
                prn_id: prn_id, 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                $("#pre-loader-1").fadeOut(300);
                if (result.prn){
                    domt_select_acc_modal(result)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
                    location.reload(true);
                }
            },
            error: function(request, msg, error) {
                $("#pre-loader-1").fadeOut(300);
                Swal.fire(
                    'Oops..',
                    'Something went wrong! try again',
                    'error'
                )
            }
        });

    }); 

    //proceed retail payment
    $('#proceed_prn_payment').on( 'click', function (event) {
        
        if(parseFloat($('#txn_amount').val()) > parseFloat($('#acc_bal').val())){
            Swal.fire(
                'Insufficient Funds..',
                'Selected Account has insufficient funds.',
                'error'
            )
        }else{
            Swal.fire({
                title: 'Proceed with PRN payment?',
                text: "You won't be able to revert this!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, continue!',
                showLoaderOnConfirm: true
                }).then((result) => {
                if (result.value) {
                    var client_type = $("#client_type").val();
                    var url = (client_type=="CORPORATE" ? "/ZRA/Domt/corporate/payment" : "/ZRA/Domt/retail/payment");
    
                    $.ajax({
                        url: url,
                        type: 'POST',
                        data: {
                            prn: $('#payment_prn').val(), 
                            dr_acc: $('input[name=dr_acc]:checked').val(), 
                            _csrf_token: $('#csrf').val()
                        },
                        success: function(result) {
                            if (result.data){
                                if (result.data){
                                    Swal.fire(
                                        'Success',
                                        result.data,
                                        'success'
                                    )   
                                }else{
                                    Swal.fire(
                                        'Oops..',
                                        result.error,
                                        'error'
                                    )
                                }
                                //location.reload(true);
                            } else {
                                Swal.fire(
                                    'Oops',
                                    result.error,
                                    'error'
                                )
                                location.reload(true);
                            }
                        },
                        error: function(request, msg, error) {
                            Swal.fire(
                                'Oops..',
                                'Something went wrong! try again',
                                'error'
                            )
                        }
                    });
                } else {
                    Swal.fire(
                        'Cancelled',
                        'Operation not performed :)',
                        'error'
                    )
                }
            })
            
        }
    });

    //------------decline prn service---------
    $('#decline_prn_btn').on( 'click', function (event) { 
        Swal.fire({
            title: 'Proceed to decline prn payment?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/ZRA/Domt/decline",
                    type: 'POST',
                    data: {
                        prn: $('#decline_prn').val(), 
                        token: $('#decline_token').val(), 
                        note: $('#reason').val(), 
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                )   
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
                            //location.reload(true);
                        } else {
                            Swal.fire(
                                'Oops',
                                result.error,
                                'error'
                            )
                            location.reload(true);
                        }
                    },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'Oops..',
                            'Something went wrong! try again',
                            'error'
                        )
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled',
                    'Operation not performed :)',
                    'error'
                )
            }
        })
    });


    //------------decline prn service---------
    $('#approve_prn_btn').on( 'click', function (event) { 
        Swal.fire({
            title: 'Proceed to Approve PRN payment?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/ZRA/Domt/approve",
                    type: 'POST',
                    data: {
                        prn: $('#approval_prn').val(), 
                        token: $('#approval_token').val(), 
                        note: $('#approver_note').val(), 
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                )   
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
                            //location.reload(true);
                        } else {
                            Swal.fire(
                                'Oops',
                                result.error,
                                'error'
                            )
                            location.reload(true);
                        }
                    },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'Oops..',
                            'Something went wrong! try again',
                            'error'
                        )
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled',
                    'Operation not performed :)',
                    'error'
                )
            }
        })
    });



    //---------------- view details-------------
    function prn_details(prn){
        var modal = $('#prn_details')
        modal.find('.modal-body #dt_init').val(prn.date_init);
        modal.find('.modal-body #Status').val(prn.status);
        modal.find('.modal-body #tpin').val(prn.tpin);
        modal.find('.modal-body #payer').val(prn.payer_name);
        modal.find('.modal-body #amount').val(prn.amount);
        
    }


    $('.prn_detailz').on( 'click', function (event) {
        var button = $(this);
        var prn_id = button.attr("data-prn");

        $.ajax({
            url: '/ZRA/Domt/prn/details',
            type: 'POST',
            data: {_csrf_token: $('#csrf').val(), prn_id: prn_id},
            success: function(result) {
                if (result.prn){
                    prn_details(result.prn)

                    $('#prn_details').modal('show');
                    
                } else {
                    Swal.fire(
                        'Oops',
                        "Failed to get PRN details",
                        'error'
                    )   
                }
            },
            error: function(request, msg, error) {
                console.log("error--------------------")
            }
        });
        
    });



    $('#dt-tax-type').on('click', '.pop', function () {
        var btn = $(this);
        var id = btn.attr("data-id")
        $.ajax({
            url: "/ZRA/Domt/pop",
            type: 'POST',
            data: {
                id: id,
                _csrf_token: $('#csrf').val()
            },
            success: function (result) {
                if (result.data) {
                    domt_receipt_modal(result)
                    console.log(result)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
                    location.reload(true);
                }
            },
            error: function (request, msg, error) {
                Swal.fire(
                    'Oops..',
                    'Something went wrong! try again',
                    'error'
                )
            }
        });

    });

    function domt_receipt_modal(result) {
        var txn = result.data
        var txn_amount = parseFloat(txn.amount)
        var modal = $('#invoice')
        modal.find('.modal-body #destin_acc_name').text(txn.destin_acc_name);
        modal.find('.modal-body #destin_acc_no').text(txn.destin_acc_no);
        modal.find('.modal-body #src_acc_no').text(txn.src_acc_no);
        modal.find('.modal-body #cbs_ref').text(txn.cbs_ref_no);
        modal.find('.modal-body #amount').text(txn.amount);
        modal.find('.modal-body #date').text(txn.trans_date);
        modal.find('.modal-body #amount_to_words').text(result.amount_to_words);
        modal.find('.modal-body #charge').text(txn.narration);
        modal.find('.modal-body #total_amount').text(txn.amount);
        console.log("Domt_receipt_modal")
        $('#invoice').modal('show');
    }

    $('#dt-basic-example tbody').on('click', '.change_fee', function () {
        var button = $(this);
        var $tr = $(this).closest('tr');
        Swal.fire({
            title: "Are you sure?",
            text: "Operation will be processed",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: "#EF5350",
            confirmButtonText: "Yes, continue!",
            cancelButtonText: "No, cancel!",
            closeOnConfirm: false,
            closeOnCancel: false,
            showLoaderOnConfirm: true
        }).then((result) => {
            if (result.value) {

                $.ajax({
                    url: '/Update/Transaction/Fee/status',
                    type: 'POST',
                    data: {
                        id: button.attr("data-role-id"),
                        status: button.attr("data-role-stat"),
                        _csrf_token: $("#csrf").val()
                    },
                    success: function (result) {
                        if (result.info) {
                            if (result.info) {
                                Swal.fire(
                                    'Success',
                                    result.info,
                                    'success'
                                )
                            } else {
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
                            location.reload(true);
                        } else {
                            Swal.fire(
                                'Oops',
                                result.error,
                                'error'
                            )
                            location.reload(true);
                        }
                    },
                    error: function (request, msg, error) {
                        Swal.fire(
                            'Oops..',
                            'Something went wrong! try again',
                            'error'
                        )
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled',
                    'Operation not performed :)',
                    'error'
                )
            }
        })
    });


});