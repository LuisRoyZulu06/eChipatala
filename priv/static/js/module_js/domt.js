$(document).ready(function() {
    //--------------------------- WALKIN -------------------------------
    function formartStatus(status) {
        var stat = null;
        if(status == "SUCCESS"){
            stat = "<span class='text-success'>SUCCESS</span>";
        }else if(status == "PENDING_APPROVAL"){
            stat = "<span class='text-primary'>PENDING APPROVAL</span>";
        }else if(status == "FAILED_PAYMENT"){
            stat = "<span class='text-danger'>FAILED BANK PAYMENT</span>";
        }else if(status == "FAILED_NOTIFICATION"){
            stat = "<span class='text-primary'>PENDING VERIFICATION</span>";
        }else if((status == "DROPPED") || (status == "DECLINED")){
            stat = "<span class='text-danger'>"+status+"</span>";
        }else if(status == "PENDING_BANK_PAYMENT"){
            stat = "<span class='text-info'>PENDING BANK PAYMENT</span>";
        }else if(status == "PENDING_NOTIFICATION"){
            stat = "<span class='text-info'>PENDING NOTIFICATION</span>";
        }else{
            stat =status
        }
        return stat;
    }

   var tbl_teller_prn = $('#tbl_teller_prn').DataTable({
    "select": {
        "style": 'multi'
    },
    "responsive": true,
    "processing": true,
    'language': {
        'loadingRecords': '&nbsp;',
        processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
        "emptyTable": "No PRNs to display"
    },
    "paging": false,
    "info": false,
    "searching": false,
    "pageLength": 1,
    "columns": [
        {"data": "prn"},
        {"data": "payer_name"},
        {"data": "tpin"},
        {"data": "amount"},
        {"data": "prn_date"},
        {"data": "prn_exp_date"},
        {
            "data": "expired",
            "class": "center",
            render: function (data, type, row) {
                if(data == false){
                    return '<span class="label text-success">ACTIVE</span>';
                } else{
                    return '<span class="label text-danger">EXPIRED</span>';
                }
            }
        }
    ],
    "order": [[1, 'asc']],
        responsive: true,
        lengthChange: false,
        'sDom': 't',
        dom:
            "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" 
    });
    tbl_teller_prn.buttons( '.export' ).remove();

    function populate_teller_prn_tbl(data) {
        tbl_teller_prn.processing(false);
        tbl_teller_prn.clear().draw();
        tbl_teller_prn.rows.add(data);
        tbl_teller_prn.columns.adjust().draw();
    }

    $('#btn_teller_fetch_prn').on( 'click', function () {
        var prn = $("#teller_prn_input").val();
        tbl_teller_prn.clear().draw();
        //document.getElementById("btn_teller_proceed").style.display = "none";

        if(prn){
            tbl_teller_prn.processing( true );
            $.blockUI();
            $.ajax({
                type: "POST",
                url: "/domt/teller/lookup",
                dataType: "json",
                data: {
                    _csrf_token: $("#csrf").val(),
                    prn: prn
                },
                success: function(data) {
                    if(data.data){
                        populate_teller_prn_tbl(data.data)
                        document.getElementById("btn_teller_proceed").style.display = "block";
                    }
                    else{
                        Swal.fire(
                            'Oops..',
                            data.error,
                            'error'
                        ) 
                    }
                },
            });

        }
        else{
            tbl_teller_prn.processing(false);
            Swal.fire(
                'Oops..',
                "Enter client PRN",
                'error'
            ) 
        }
    });

    $("#teller_domt_form").on('submit', function(e){
        e.preventDefault();
        $('#modal_teller_kyc').modal('hide');

        var form = $(this);
        $.blockUI();
        $.ajax({
            url: "/domt/teller/payment",
            type: 'POST',
            data: {
                _csrf_token: $('#csrf').val(),
                client: getFormData(form),
                prn: tbl_teller_prn.row(':eq(0)').data()
            },
            success: function(result) {
                if (result.data){
                    if (result.data){
                        Swal.fire(
                            'Success',
                            result.data,
                            'success'
                        ).then(function(){ 
                            location.reload();
                            }
                        );
                         
                    }else{
                        Swal.fire(
                            'Oops..',
                            result.error,
                            'error'
                        )
                    }
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
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
    });

    function getFormData(form){
        var unindexed_array = form.serializeArray();
        var indexed_array = {};
    
        $.map(unindexed_array, function(n, i){
            indexed_array[n['name']] = n['value'];
        });
    
        return indexed_array;
    }

    // TAX CONSULTANCY

    $('.btn_agent_proceed').on('click', function(){
        var obj = $('#raw_prn_data').val()
        // data = JSON.stringify(obj)
        console.log(obj)
        prn = $('#btn-submit').data('prn');
        amount = $('#btn-submit').data('amount');
        accounts = $('#btn-submit').data('accounts');
        payer_name = $('#btn-submit').data('payer_name');
        charge = $('#charge').val();
        console.log(amount + ' :' + prn)
        result = {
            prn: {prn: prn, amount: amount,
                payer_name: payer_name},
            accounts: accounts,
            charge: charge
        }
        domt_select_agent_acc_modal(result);
        console.log(result);
    });

    function domt_select_agent_acc_modal(result){
        // console.log(result);
        var prn = result.prn
        var accounts = result.accounts
        var amount = parseFloat(prn.amount)
        var charge = parseFloat($('#charge').val())
        var total_amount = amount+charge
        var modal = $('#domt_agent_payment');
        // console.log(prn)
        $('#total_amount').val(total_amount);

        modal.find('.modal-body #prn_amount').text(formartAmount(amount));
        modal.find('.modal-body #prn').text(prn.prn);
        modal.find('.modal-body #name').text(prn.payer_name);
        modal.find('.modal-body #charge').text(formartAmount(charge));
        modal.find('.modal-body #total').text(formartAmount(total_amount));
        $('#agent_accounts').DataTable( {
            language: {"emptyTable": "Account balance inquiry failed."},
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: accounts,
            columns: [
            {
                "data": "account",
                "render": function ( account, type, row ) {
                    return '<input type="radio" name="domt_agent_dr_acc" value="'+account+'">';                  
                }
            },
            {"data": "name"},
            {"data": "balance"},
            {"data": "account"}
            ]
        });
        // $('#domt_agent_payment').modal('show');
    }

    var tbl_agent_prn = $('#tbl_agent_prn').DataTable({
        "select": {
            "style": 'multi'
        },
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No PRNs to display"
        },
        "paging": false,
        "info": false,
        "searching": false,
        "pageLength": 1,
        "columns": [
            {"data": "prn"},
            {"data": "payer_name"},
            {"data": "tpin"},
            {"data": "amount"},
            {"data": "prn_date"},
            {"data": "prn_exp_date"},
            {
                "data": "expired",
                "class": "center",
                render: function (data, type, row) {
                    if(data == false){
                        return '<span class="label text-success">ACTIVE</span>';
                    } else{
                        return '<span class="label text-danger">EXPIRED</span>';
                    }
                }
            }
        ],
        "order": [[1, 'asc']],
            responsive: true,
            lengthChange: false,
            'sDom': 't',
            dom:
                "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" 
        });
        tbl_agent_prn.buttons( '.export' ).remove();

    function populate_agent_prn_tbl(data) {
        tbl_agent_prn.processing(false);
        tbl_agent_prn.clear().draw();
        tbl_agent_prn.rows.add(data);
        tbl_agent_prn.columns.adjust().draw();
    }

    $('#btn_agent_fetch_prn').on( 'click', function () {
        var prn = $("#agent_prn_input").val();
        tbl_teller_prn.clear().draw();
        //document.getElementById("btn_teller_proceed").style.display = "none";

        if(prn){
            tbl_teller_prn.processing( true );
            $.blockUI();
            $.ajax({
                type: "POST",
                url: "/domt/agent/lookup",
                dataType: "json",
                data: {
                    _csrf_token: $("#csrf").val(),
                    prn: prn
                },
                success: function(data) {
                    // console.log( data.data[0].amount);
                    if(data.data){
                        // console.log(data.charge);
                        $('#raw_prn_data').val(JSON.stringify(data.data[0]));
                        // $('#raw_prn_data').val(data.data[0]);
                        $('#charge').val(data.charge);
                        $('#btn-submit').data('prn', data.data[0].prn);
                        $('#btn-submit').data('accounts', data.accounts);
                        $('#btn-submit').data('amount', data.data[0].amount);
                        $('#btn-submit').data('payer_name', data.data[0].payer_name);
                        populate_agent_prn_tbl(data.data)
                        document.getElementById("btn_agent_proceed").style.display = "block";
                    }
                    else{
                        Swal.fire(
                            'Oops..',
                            data.error,
                            'error'
                        ) 
                    }
                },
            });

        }
        else{
            tbl_agent_prn.processing(false);
            Swal.fire(
                'Oops..',
                "Enter client PRN",
                'error'
            ) 
        }
    });

    $('#domt_agent_submit').on( 'click', function (event) {
        var dr_acc = $("input[name='domt_agent_dr_acc']:checked").val();
        var amount = $('#total_amount').val();
        var prn_data = JSON.parse($('#raw_prn_data').val());

        $('#domt_agent_payment').modal('hide');
        if(!dr_acc){
            Swal.fire(
                'Error!',
                'You have not selected a payment account! Please select an account.',
                'error'
            )
            return false;
        }

        Swal.fire({
            title: 'Proceed payment submission?',
            text: "proceed with PRN payment",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, proceed!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: "/domt/agent/init/payment",
                    type: 'POST',
                    data: {
                        prn: prn_data,
                        total_amount: amount, 
                        dr_acc: dr_acc, 
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );
                                 
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
                        } else {
                            Swal.fire(
                                'Oops',
                                result.error,
                                'error'
                            )
                        }
                    },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'Oops..',
                            'An error occurred during processing! Please try again..',
                            'error'
                        )
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled',
                    'Payment submission cancelled.',
                    'error'
                )
            }
        })
    }); 

    // // TAX CONSULTANCY

    // $('.btn_agent_proceed').on('click', function(){
    //     var obj = $('#raw_prn_data').val()
    //     // data = JSON.stringify(obj)
    //     console.log(obj)
    //     prn = $('#btn-submit').data('prn');
    //     amount = $('#btn-submit').data('amount');
    //     accounts = $('#btn-submit').data('accounts');
    //     payer_name = $('#btn-submit').data('payer_name');
    //     charge = $('#charge').val();
    //     console.log(amount + ' :' + prn)
    //     result = {
    //         prn: {prn: prn, amount: amount,
    //             payer_name: payer_name},
    //         accounts: accounts,
    //         charge: charge
    //     }
    //     domt_select_agent_acc_modal(result);
    //     console.log(result);
    // });

    // function domt_select_agent_acc_modal(result){
    //     // console.log(result);
    //     var prn = result.prn
    //     var accounts = result.accounts
    //     var amount = parseFloat(prn.amount)
    //     var charge = parseFloat($('#charge').val())
    //     var total_amount = amount+charge
    //     var modal = $('#domt_agent_payment')
    //     console.log(prn)
    //     modal.find('.modal-body #total_amount').val(total_amount);
    //     modal.find('.modal-body #prn').text(prn.prn);
    //     modal.find('.modal-body #name').text(prn.payer_name);
    //     modal.find('.modal-body #amount').text(formartAmount(amount));
    //     modal.find('.modal-body #charge').text(formartAmount(charge));
    //     modal.find('.modal-body #total').text(formartAmount(total_amount));
    //     $('#agent_accounts').DataTable( {
    //         language: {"emptyTable": "Account balance inquiry failed."},
    //         paging: false,
    //         info: false,
    //         dom: "lfrti",
    //         bFilter: false,
    //         data: accounts,
    //         columns: [
    //         {
    //             "data": "account",
    //             "render": function ( account, type, row ) {
    //                 return '<input type="radio" name="domt_dr_acc" value="'+account+'">';                  
    //             }
    //         },
    //         {"data": "name"},
    //         {"data": "balance"},
    //         {"data": "account"}
    //         ]
    //     });
    //     // $('#domt_agent_payment').modal('show');
    // }

    // var tbl_agent_prn = $('#tbl_agent_prn').DataTable({
    //     "select": {
    //         "style": 'multi'
    //     },
    //     "responsive": true,
    //     "processing": true,
    //     'language': {
    //         'loadingRecords': '&nbsp;',
    //         processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
    //         "emptyTable": "No PRNs to display"
    //     },
    //     "paging": false,
    //     "info": false,
    //     "searching": false,
    //     "pageLength": 1,
    //     "columns": [
    //         {"data": "prn"},
    //         {"data": "payer_name"},
    //         {"data": "tpin"},
    //         {"data": "amount"},
    //         {"data": "prn_date"},
    //         {"data": "prn_exp_date"},
    //         {
    //             "data": "expired",
    //             "class": "center",
    //             render: function (data, type, row) {
    //                 if(data == false){
    //                     return '<span class="label text-success">ACTIVE</span>';
    //                 } else{
    //                     return '<span class="label text-danger">EXPIRED</span>';
    //                 }
    //             }
    //         }
    //     ],
    //     "order": [[1, 'asc']],
    //         responsive: true,
    //         lengthChange: false,
    //         'sDom': 't',
    //         dom:
    //             "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
    //             "<'row'<'col-sm-12'tr>>" +
    //             "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" 
    //     });
    //     tbl_agent_prn.buttons( '.export' ).remove();

    // function populate_agent_prn_tbl(data) {
    //     tbl_agent_prn.processing(false);
    //     tbl_agent_prn.clear().draw();
    //     tbl_agent_prn.rows.add(data);
    //     tbl_agent_prn.columns.adjust().draw();
    // }

    // $('#btn_agent_fetch_prn').on( 'click', function () {
    //     var prn = $("#agent_prn_input").val();
    //     tbl_teller_prn.clear().draw();
    //     //document.getElementById("btn_teller_proceed").style.display = "none";

    //     if(prn){
    //         tbl_teller_prn.processing( true );
    //         $.blockUI();
    //         $.ajax({
    //             type: "POST",
    //             url: "/domt/agent/lookup",
    //             dataType: "json",
    //             data: {
    //                 _csrf_token: $("#csrf").val(),
    //                 prn: prn
    //             },
    //             success: function(data) {
    //                 // console.log( data.data[0].amount);
    //                 if(data.data){
    //                     // console.log(data.charge);
    //                     $('#raw_prn_data').val(JSON.stringify(data));
    //                     $('#charge').val(data.charge);
    //                     $('#btn-submit').data('prn', data.data[0].prn);
    //                     $('#btn-submit').data('accounts', data.accounts);
    //                     $('#btn-submit').data('amount', data.data[0].amount);
    //                     $('#btn-submit').data('payer_name', data.data[0].payer_name);
    //                     populate_agent_prn_tbl(data.data)
    //                     document.getElementById("btn_agent_proceed").style.display = "block";
    //                 }
    //                 else{
    //                     Swal.fire(
    //                         'Oops..',
    //                         data.error,
    //                         'error'
    //                     ) 
    //                 }
    //             },
    //         });

    //     }
    //     else{
    //         tbl_agent_prn.processing(false);
    //         Swal.fire(
    //             'Oops..',
    //             "Enter client PRN",
    //             'error'
    //         ) 
    //     }
    // });


    //================================== TELLER TRANSACTIONS ========================
    var tbl_domt_teller_txns = $('#tbl_domt_teller_reports').DataTable({
        "select": {
            "style": 'multi'
        },
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "Empty"
        },
        "paging": true,
        "pageLength": 10,
        "serverSide": true,
        "ajax": {
            "type"   : "POST",
            "url"    : '/domt/teller/reports',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "status": $("#status").val(),
                "prn": $("#prn").val(),
                "tpin": $("#tpin").val(),
                "amount": $("#amount").val(),
                "payer_name": "",
                "from": $("#from").val(),
                "to": $("#to").val()
            }
        },
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {"data": "ref_id"},
            {"data": "prn"},
            {"data": "payer_name"},
            {
                "data": "amount",
                "render": function ( data, type, row ) {
                    if(data){
                        return formartAmount(data.replace(/\,/g, ''));
                    } else{
                        "<span class='text-danger'>Not Set</span>"
                    }
                }
            },
            {"data": "prn_exp_date"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartStatus(data)
                }
            },
            {
                "data": "id",
                "render": function (data, type, row) {
                    if(row.status == "SUCCESS"){
                        return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
                        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                            '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a>'+
                            '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-info view_kyc">KYC Details</a>'+
                        '</div>';
                    }
                    else{
                        return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
                        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                            '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-info view_kyc">KYC Details</a>'+
                        '</div>';
                    }
                },
                "defaultContent": "<span class='text-danger'>Not Set</span>"
            } 
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']],
            responsive: true,
            lengthChange: true,
            dom:
                "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" 
        });
    
        $('#tbl_domt_teller_reports').on('click', 'td.details-control', function () {
            var tr = $(this).closest('tr');
            var row = tbl_domt_teller_txns.row(tr);
    
            if (row.child.isShown()) {
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                row.child(formatSearchDetails(row.data())).show();
                tr.addClass('shown');
            }
        });
    
        //------------------Domt client transactions report table--------------------- 
        $('#btn_domt_teller_filter').on( 'click', function () {
            tbl_domt_teller_txns.on('preXhr.dt', function ( e, settings, data ) {
                data._csrf_token = $("#csrf").val();
                data.tpin = $('#tpin').val();
                data.prn = $('#prn').val();
                data.amount = $('#amount').val();
                data.payer_name = "";
                data.status = $('#status').val();
                data.from = $('#from').val();
                data.to = $('#to').val();  
            } );
            $('#filter').modal('hide');
            tbl_domt_teller_txns.draw();
        });

        function display_kyc_details(kyc){
            var modal = $('#kyc_details')

            modal.find('.modal-body #company').val(kyc.company_name);
            modal.find('.modal-body #address').val(kyc.payer_address);
            modal.find('.modal-body #email').val(kyc.payer_email);
            modal.find('.modal-body #mobile').val(kyc.payer_mobile);
            modal.find('.modal-body #name').val(kyc.payer_name);
            modal.find('.modal-body #nrc').val(kyc.payer_nrc);
            $('#kyc_details').modal('show');
        }



        $('#tbl_domt_teller_reports tbody').on('click', '.view_kyc', function () {
            $.blockUI();
            $.ajax({
                url: "/domt/teller/kyc",
                type: 'POST',
                data: {
                    ref_id: $(this).attr("data-ref_id"), 
                    _csrf_token: $('#csrf').val()
                },
                success: function(result) {
                    console.log(result)
                    if (result.data){
                        display_kyc_details(result.data)
                    } else {
                        Swal.fire(
                            'Oops',
                            result.error,
                            'error'
                        )
                    }
                },
                error: function(request, msg, error) {
                    Swal.fire(
                        'Oops..',
                        'Something went wrong! try again',
                        'error'
                    )
                }
            })
        });

        $('#tbl_domt_teller_reports tbody').on('click', '.reciept', function() {
            var btn = $(this);
            var id = btn.attr("data-id");
            $.blockUI();
             $.ajax({
                 url: "/domt/reciept",
                 type: 'POST',
                 data: {
                     id: id, 
                     _csrf_token: $('#csrf').val()
                 },
                 success: function(result) {
                     if (result.data){
                         reciept_modal(result)
                     } else {
                         Swal.fire(
                             'Oops',
                             result.error,
                             'error'
                         )
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
     
         });

    //===============================================================================

    //approval modal data passing
    $('#approve_prn_modal').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #ap_prn_id').val(button.attr("data-prn_id"));
    });

    $('#decline_prn_modal').on('show.bs.modal', function (event){
        var button = $(event.relatedTarget)
        var modal = $(this)
        modal.find('.modal-body #de_prn_id').val(button.attr("data-prn_id"));
    });



    $('#prn_details').on('show.bs.modal', function (event){
         var button = $(event.relatedTarget)
         var modal = $(this)
 
         modal.find('.modal-body #prn').val(button.data('prn'));
         modal.find('.modal-body #tpin').val(button.data('tpin'));
         modal.find('.modal-body #payer_name').val(button.data('emp_name'));
         modal.find('.modal-body #amount').val(button.data('amount'));
         modal.find('.modal-body #prn_date').val(button.data('date'));
         modal.find('.modal-body #prn_exp_date').val(button.data('exp_date'));  
     });


     $('.client_drop_prn').on( 'click', function (event) {
        var id = $(event.target).attr("data-id"); 
        var modal = $('#drop_domt_modal');
        modal.find('.modal-body #drop_payment_id').val(id);
        $('#drop_domt_modal').modal('show');
    });


    //------------drop PRN---------
   $('#drop_domt_btn').on('click', function() {
        var decline_note = $('#drop_note').val();

        if(decline_note){
            Swal.fire({
                title: 'Are you sure you want to drop payment?',
                text: "You won't be able to revert this!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, drop',
                cancelButtonText: 'No',
                showLoaderOnConfirm: true
                }).then((result) => {
                if (result.value) {
                    $.blockUI();
                    $.ajax({
                        url: "/domt/prn/drop",
                        type: 'POST',
                        data: {
                            id: $('#drop_payment_id').val(),
                            note: decline_note, 
                            _csrf_token: $('#csrf').val()
                        },
                        success: function(result) {
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                ).then((val)=>{
                                    location.reload();
                                })
                            } else {
                                Swal.fire(
                                    'Oops',
                                    result.error,
                                    'error'
                                )
                            }
                        },
                        error: function(request, msg, error) {
                            Swal.fire(
                                'Oops..',
                                'An error occurred! Please try again!',
                                'error'
                            )
                        }
                    });
                } else {
                    Swal.fire(
                        'Cancelled',
                        'Drop operation cancelled.',
                        'error'
                    )
                }
            });
        }else{
            Swal.fire(
                'Error',
                'Kindly provide a review reason!',
                'error'
            )
        }
    });

    function object_to_float(amount){
        var num= amount.coef.toString()
        num =num.substring(0, num.length - 2) + "." + num.substring(num.length - 2);
        return parseFloat(num) 
    }



    //---------------------display submission result ----------- 
    function domt_select_acc_modal(result){
        var prn = result.prn
        var accounts = result.accounts
        var amount = parseFloat(prn.amount)
        var charge = parseFloat($('#txn_charge').val())
        var total_amount = amount+charge
        var modal = $('#domt_payment')

        modal.find('.modal-body #total_amount').val(total_amount);
        modal.find('.modal-body #payment_prn').val(prn.prn);
        modal.find('.modal-body #charge').text(formartAmount(charge));
        modal.find('.modal-body #total').text(formartAmount(total_amount));
        $('#accounts').DataTable( {
            language: {"emptyTable": "Account balance inquiry failed."},
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: accounts,
            columns: [
            {
                "data": "account",
                "render": function ( account, type, row ) {
                    return '<input type="radio" name="domt_dr_acc" value="'+account+'">';                  
                }
            },
            {"data": "name"},
            {"data": "balance"},
            {"data": "account"}
            ]
        });
        $('#domt_payment').modal('show');
    }

    //------------ RETAIL DOMT PAYMENT---------
    $('.domt_init_prn').on( 'click', function (event) {
        $.blockUI();
        $.ajax({
            url: "/domt/confirmation",
            type: 'POST',
            timeout: 240000,//4 minute
            data: {
                id: $(event.target).attr("data-id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.prn){
                    domt_select_acc_modal(result)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'Oops..',
                    'An error occurred during processing. Please try again..',
                    'error'
                )
            }
        });

    });


    //------------napsa submit---------
    $('#domt_submit').on( 'click', function (event) {
        var dr_acc = $("input[name='domt_dr_acc']:checked").val();
        var amount = $('#total_amount').val()

        $('#domt_payment').modal('hide');
        if(!dr_acc){
            Swal.fire(
                'Error!',
                'You have not selected a payment account! Please select an account.',
                'error'
            )
            return false;
        }

        Swal.fire({
            title: 'Proceed payment submission?',
            text: "proceed with PRN payment",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, proceed!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: "/domt/init/payment",
                    type: 'POST',
                    data: {
                        prn: $('#payment_prn').val(),
                        total_amount: amount, 
                        dr_acc: dr_acc, 
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );
                                 
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
                        } else {
                            Swal.fire(
                                'Oops',
                                result.error,
                                'error'
                            )
                        }
                    },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'Oops..',
                            'An error occurred during processing! Please try again..',
                            'error'
                        )
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled',
                    'Payment submission cancelled.',
                    'error'
                )
            }
        })
    }); 


    function domt_pending_approval_details(result){
        var prn = result.prn
        var workflow = result.workflow
        var modal = $('#pending_appr_details_modal')

        modal.find('.modal-body #payment_prn').val(prn.prn);
        modal.find('.modal-body #prn').val(prn.prn);
        modal.find('.modal-body #amount').val(prn.amount);
        modal.find('.modal-body #dr_acc').val(prn.dr_acc);
        modal.find('.modal-body #payer_name').val(prn.payer_name);
        modal.find('.modal-body #prn_date').val(prn.prn_date);
        modal.find('.modal-body #prn_exp_date').val(prn.prn_exp_date);
        modal.find('.modal-body #tpin').val(prn.tpin);
        $('#workflow').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: workflow,
            columns: [
                {"data": "auth_level"},
                {
                    "data": "initiator",
                    "render": function ( initiator, type, row ) {
                        return initiator.first_name+' '+initiator.last_name;                  
                    }
                },
                {
                    "data": "approver",
                    "render": function ( approver, type, row ) {
                        return (approver? approver.first_name+' '+approver.last_name : '')                    
                    }
                },
                {
                    "data": "status",
                    "class": "center",
                    render: function (data, type, row) {
                        if(data == 'APPROVED'){
                            return '<span class="label text-success">'+data+'</span>';
                        } else if (data=='PENDING_APPROVAL') {
                            return '<span class="label text-info">'+data+'</span>';
                        } else{
                            return '<span class="label text-danger">'+data+'</span>';
                        }
                    }
                },
            ]
        });
        $('#pending_appr_details_modal').modal('show');
    }


    $('.domt_view_prn_details').on( 'click', function (event) {
        $.blockUI();
        $.ajax({
            url: "/domt/pending/approval/details",
            type: 'POST',
            data: {
                id: $(event.target).attr("data-id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.prn){
                    console.log(result.prn)
                    domt_pending_approval_details(result)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
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

    }); 

    $('#dt_domt_approval').on('click', '.domt_approve_prn_btn', function() {
        var btn = $(this);
        var prn_id = btn.attr("data-prn_id");
        Swal.fire({
            title: 'Are you sure you want to approve PRN?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, approve!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: "/domt/approve",
                    type: 'POST',
                    data: {
                        id: prn_id, //$('#ap_prn_id').val() 
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );     
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
                        } else {
                            Swal.fire(
                                'Oops',
                                result.error,
                                'error'
                            )
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
                    'Approve operation cancelled',
                    'error'
                )
            }
        })
    });


    $('#dt_domt_approval').on('click', '.domt_decline_prn_btn', function() {
        var btn = $(this);
        var prn_id = btn.attr("data-prn_id");

        Swal.fire({
            title: 'Are you sure you want to decline PRN?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, decline!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    url: "/domt/decline",
                    type: 'POST',
                    data: {
                        id: prn_id,
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );     
                            }else{
                                Swal.fire(
                                    'Oops..',
                                    result.error,
                                    'error'
                                )
                            }
        
                        } else {
                            Swal.fire(
                                'Oops',
                                result.error,
                                'error'
                            )
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
                    'Decline operation cancelled',
                    'error'
                )
            }
        })
    });


    // Transaction Report/Analytics
    function formatSearchDetails ( d ) {
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>TPIN: '+format_value(d.tpin)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Bank ref: '+format_value(d.cbs_ref)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Transaction charge: '+format_value(d.charge_amount)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>PRN Date: '+formartStatus(d.prn_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>PRN Expiry Date: '+format_value(d.prn_exp_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date initiated: '+format_value(d.initiator_date)+'</td>'+
            '</tr>'+
        '</table>';
    }

    function formartStatus(status) {
        var stat = null;
        if(status == "SUCCESS"){
            stat = "<span class='text-success'>SUCCESS</span>";
        }else if(status == "PENDING_BANK_PAYMENT"){
            stat = "<span class='text-primary'>PENDING BANK PAYMENT</span>";
        }else if(status == "FAILED_PAYMENT"){
            stat = "<span class='text-danger'>FAILED</span>";
        }else if(status == "FAILED_NOTIFICATION"){
            stat = "<span class='text-danger'>PENDING VERIFICATION</span>";
        }else if((status == "DROPPED") || (status == "DECLINED")){
            stat = "<span class='text-info'>"+status+"</span>";
        }else{
            stat = status
        }
        return stat;
    }

   var tbl_domt_report = $('#tbl_domt_reports').DataTable({
    "select": {
        "style": 'multi'
    },
    "responsive": true,
    "processing": true,
    'language': {
        'loadingRecords': '&nbsp;',
        processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
        "emptyTable": "No PRNs to display"
    },
    "paging": true,
    "pageLength": 10,
    "serverSide": true,
    "ajax": {
        "type"   : "POST",
        "url"    : '/domt/reports',
        "data"   : {
            "_csrf_token": $("#csrf").val(),
            "status": $("#status").val(),
            "prn": $("#prn").val(),
            "tpin": $("#tpin").val(),
            "amount": $("#amount").val(),
            "payer_name": $("#payer_name").val(),
            "from": $("#from").val(),
            "to": $("#to").val()
        }
    },
    "columns": [
        {
            "className": 'details-control',
            "orderable": false,
            "data": null,
            "defaultContent": ''
        },
        {"data": "ref_id"},
        {"data": "payer_name"},
        {"data": "prn"},
        {
            "data": "amount",
            "render": function ( data, type, row ) {
                if(data){
                    return formartAmount(data.replace(/\,/g, ''));
                } else{
                    "<span class='text-danger'>Not Set</span>"
                }
            }
        },
        {"data": "dr_acc"},
        {"data": "prn_date"},
        {
            "data": "status",
            "render": function (data, type, row) {
                return formartStatus(data)
            }
        },
        {
            "data": "id",
            "render": function (data, type, row) {
                if(row.status == "SUCCESS"){
                    return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a>'+
                        '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success domt_approval_tray">Approval Audit Trail</a></div>'+
                    '</div>';
                }
                else{
                    return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" class="dropdown-item text-danger">No Action</a>'+
                        '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success domt_approval_tray">Approval Audit Trail</a></div>'+
                    '</div>';
                }
            },
            "defaultContent": "<span class='text-danger'>Not Set</span>"
        } 
    ],
    "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
    "order": [[1, 'asc']],
        responsive: true,
        lengthChange: false,
        dom:
            "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" 
    });



    $('#tbl_domt_reports tbody').on('click', '.domt_approval_tray', function () {
        var btn = $(this);
        var ref_id = btn.attr("data-ref_id")
		$.ajax({
            url: "/report/approval/trial",
            type: 'POST',
            data: {
                ref_id: $(this).attr("data-ref_id"),
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    approval_trial_modal(result.data)
                } else {
                    Swal.fire(
                        result.error,
                        'error'
                    )
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'Oops..',
                    'Something went wrong! try again',
                    'error'
                )
            }
        })
    });


     //------------------Pending Approval Audit Trail--------------------------
     $(".domt_pending_approval_modal").on("click", function(){
        $.blockUI();
        var btn = $(this);
        var ref_id = btn.attr("data-ref_id")
        $.ajax({
            url: "/report/approval/trial",
            type: 'POST',
            data: {
                ref_id: $(this).attr("data-ref_id"),
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    approval_trial_modal(result.data)
                } else {
                    Swal.fire(
                        result.error,
                        'error'
                    )
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
    });

     //---------------- Client report approval trail details modal ----------------
     function approval_trial_modal(workflow){
        $('#trail').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: workflow,
            columns: [
                {"data": "auth_level"},
                {
                    "data": "initiator",
                    "render": function ( initiator, type, row ) {
                        return initiator.first_name+' '+initiator.last_name;                  
                    }
                },
                {"data":"initiator_date"},
                {
                    "data": "approver",
                    "render": function ( approver, type, row ) {
                        return (approver? approver.first_name+' '+approver.last_name : '')                    
                    }
                },
                {"data":"approver_date"},
                {
                    "data": "status",
                    "class": "center",
                    render: function (data, type, row) {
                        if(data == 'APPROVED'){
                            return '<span class="label text-success">'+data+'</span>';
                        } else if (data=='PENDING_APPROVAL') {
                            return '<span class="label text-info">'+data+'</span>';
                        } else{
                            return '<span class="label text-danger">'+data+'</span>';
                        }
                    }
                },
            ]
        });
        $('#approval_trial_modal').modal('show');
    }

    $('#approval_trial_modal').on('hidden.bs.modal', function (event){
        $('#trail').DataTable().clear().destroy();
    });



    $('#tbl_domt_reports').on('click', 'td.details-control', function () {
		var tr = $(this).closest('tr');
		var row = tbl_domt_report.row(tr);

		if (row.child.isShown()) {
			row.child.hide();
			tr.removeClass('shown');
		}
		else {
			row.child(formatSearchDetails(row.data())).show();
			tr.addClass('shown');
		}
	});

    $('#domt_client_excel').on( 'click', function (event) {
        $('#domtSearchForm').attr('action', '/domt/client/export/excel');
        $('#domtSearchForm').attr('method', 'GET');
        $("#domtSearchForm").submit();
    });

    $('#reload_table').on( 'click', function () {
		tbl_domt_report.ajax.reload();
    });

    //------------------Domt client transactions report table--------------------- 
    $('#btn_domt_report_filter').on( 'click', function () {
        tbl_domt_report.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.tpin = $('#tpin').val();
            data.prn = $('#prn').val();
            data.amount = $('#amount').val();
            data.status = $('#status').val();
            data.payer_name = $('#payer_name').val();
            data.from = $('#from').val();
            data.to = $('#to').val();  
        } );
        $('#filter').modal('hide');
        tbl_domt_report.draw();
    });


    $('#tbl_domt_reports tbody').on('click', '.domt_vw_dtls', function () {
        $.blockUI();
		$.ajax({
            url: "/domt/pending/approval/details",
            type: 'POST',
            data: {
                id: $(this).attr("data-id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.prn){
                    domt_pending_approval_details(result)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'Oops..',
                    'Something went wrong! try again',
                    'error'
                )
            }
        })
    });



    //------------------RECIEPT--------------------------
    $('#tbl_domt_reports').on('click', '.reciept', function() {
        var btn = $(this);
        var id = btn.attr("data-id");
        $.blockUI();
        $.ajax({
            url: "/domt/reciept",
            type: 'POST',
            data: {
                id: id, 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    reciept_modal(result)
                } else {
                    Swal.fire(
                        'Oops',
                        result.error,
                        'error'
                    )
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
 
     });




    function reciept_modal(result){
        var prn = result.data
        console.log(prn)
        var txn_amount =  formartAmount(prn.amount)
        var modal = $('#domt_reciept')
        modal.find('.modal-body #tax_payer').text(prn.payer_name);
        modal.find('.modal-body #Payment_date').text(prn.payment_date);
        modal.find('.modal-body #Prn_date').text(prn.prn_date);
        modal.find('.modal-body #tpin').text(prn.tpin);
        modal.find('.modal-body #prn').text(prn.prn);
        modal.find('.modal-body #address').text(prn.address);
        modal.find('.modal-body #bank_ref').text(prn.cbs_ref);
        modal.find('.modal-body #mid').text(prn.merchant_id);
        modal.find('.modal-body #prn_amount').text(txn_amount);
        modal.find('.modal-body #amount_words').text(prn.amount_words);
        
        $('#domt_reciept').modal('show');
    }




    //-------------- Destroy datatable when modal closed----------
    $('#domt_payment').on('hidden.bs.modal', function (event){
        $('#accounts').DataTable().clear().destroy();
    });

    $('#domt_agent_payment').on('hidden.bs.modal', function (event){
        $('#agent_accounts').DataTable().clear().destroy();
    });

    $('#prn_details').on('hidden.bs.modal', function (event){
        $('#workflow').DataTable().clear().destroy();
    });

    $('#modal_pending_appr_details').on('hidden.bs.modal', function (event){
        $('#workflow').DataTable().clear().destroy();
    });

  
});

