$(document).ajaxStart($.blockUI);
$(document).ready(function() {
    $(document).ajaxStop($.unblockUI);

    function formatSearchDetails ( t ) {
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>Currency: '+format_value(t.currency)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Declarant code: '+format_value(t.declarant_code)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Batch Ref: '+format_value(t.ref_id)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Trans Ref: '+format_value(t.txn_ref)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Interest Amount: '+format_value(t.interest_amount)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Transaction Charge: '+format_value(t.charge_amount)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date Initiated: '+format_value(t.initiator_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date Approved: '+format_value(t.approver_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Payment account: '+format_value(t.dr_acc)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Payment Status Description: '+format_value(t.status_description)+'</td>'+
            '</tr>'+
        '</table>';
    }


    jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
        return this.iterator( 'table', function ( ctx ) {
            ctx.oApi._fnProcessingDisplay( ctx, show );
        } );
    } );

    // setTimeout( function () {
    //     table.processing( false );
    // }, 20000 );

    var currency = "";
    var type ="";
    var txn_chrg = "";

    var assessments_details= "";
    var assessments_tbl = $('#assessment-dts').DataTable(
      {
        "responsive": true,
        "processing": true,
        "select": {
            "style": 'multi'
        },
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Assessments"
        },
          
        "paging": true,
        "serverSide": false,
        "columns": [
            {"data": ""},
            {"data": "reg_num"},
            {"data": "tpin"},
            {"data": "declarant_code"},
            {"data": "port"},
            {"data": "reg_year"},
            {"data": "reg_serial"},
            {"data": "amount"},
            {
                "data": "has_interest",
                "render": function ( data, type, row ) {
                    if(data == "1"){
                        return "YES";
                    } else{
                        return "NO";
                    }
                }
            },
            {"data": "interest_amount"},
            {"data": "status"},
            {"data": null}
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']],
        'columnDefs': [
            {
                targets: 0,
                defaultContent: '',
                orderable: false,
                className: 'select-checkbox',
                createdCell:  function (td, cellData, rowData, row, col){
                    if (rowData.status == "ACTIVE" || rowData.status == "BLOCKED" ) {
                        $(td).addClass( 'select-enabled' );
                        // $(td).removeClass( 'select-enabled' );
                    } else {
                        $(td).removeClass( 'select-enabled' );
                        // $(td).addClass( 'select-enabled' );
                    }
                }
            },
            {
                'targets': 11,
                "render": function (data, type, row) {
                    assessments_details = data;
                    var asmnt = row.reg_num+"+"+row.reg_year+"+"+row.reg_serial+"+"+row.port
                    return '<button class="btn btn-primary btn-xs view_b" data-asmnt="'+asmnt+'" data-toggle="modal" data-target="#breakdown" style="margin-top:0px !important; padding-top: 0px !important;">Breakdown</button>';
                }
            },
            {
                "targets": 2,
                "className": "text-center"
            },
            {
                "targets": 3,
                "className": "text-center"
            },
            {
                "targets": 6,
                "className": "text-center"
            }
        ],
        responsive: true,
        lengthChange: false,
        dom:'Blfrtip',
        buttons: [
            {
                extend: 'selectAll',
                action: function() {
                    assessments_tbl.rows(function ( idx, data, node ) {
                    return data['status'] === 'ACTIVE'? true: false;
                }).select();
                }
            },
            'selectNone',

        ]
    });

    function populate_assessments(currency, assessments) {
        if (assessments.length == 0) {
            assessments_tbl.context[0].oLanguage.sEmptyTable = "No Assessments Found...";
            assessments_tbl.clear().draw();
        }
        else{
            assessments_tbl.processing(false);
            assessments_tbl.clear().draw();
            assessments_tbl.rows.add(assessments);
            assessments_tbl.columns.adjust().draw();
            document.getElementById("panel-2").style.display = "block";

            tbl_profile_accs.on('preXhr.dt', function ( e, settings, data ) {
                data._csrf_token = $("#csrf").val();
                data.currency = currency;
            } );
            tbl_profile_accs.draw();
        }
        assessments_tbl.processing(false);
    }

    //---------------- fetch client ---------
    var from = "";
    var to = "";
    $('#fetch_assessments').on( 'click', function () {
        var client = JSON.parse($("#client_tpin").val());
        currency = $("#currency").val();
        from = $("#from_asmnt").val();
        to = $("#to_asmnt").val();

        if(currency){
            assessments_tbl.processing( true );
            $.blockUI();
            $.ajax({
                type: "POST",
                url: "/assessments/fetch",
                dataType: "json",
                timeout: 180000,//1 minute
                data: {
                    _csrf_token: $("#csrf").val(),
                    client: client,
                    currency: currency,
                    from: from,
                    to: to
                },
                success: function(data) {
                    if(data.data){
                        txn_chrg = parseFloat(data.data.charge)
                        populate_assessments(currency, data.data.assessments)
                    }
                    else{
                        Swal.fire(
                            'Oops..',
                            data.error,
                            'error'
                        )
                       // $('.error').text(data.error);
                        assessments_tbl.processing(false);
                    }
                },
                error: function(request, msg, error) {
                    $('.error').text(msg);
                    assessments_tbl.processing(false);
                }
            });

        }
        else{
            assessments_tbl.processing(false);
            Swal.fire(
                'Oops..',
                "Kindly select currency!",
                'error'
            )
        }
    });

    //Function to pull selected assessments
    function get_selected_assessments(){
        var assessments =[];
        var sum = 0;

        assessments_tbl.rows( { selected: true } ).every(function(rowIdx) {
            var assessment = {
                reg_num: assessments_tbl.row(rowIdx).data().reg_num,
                tpin: assessments_tbl.row(rowIdx).data().tpin,
                declarant_code: assessments_tbl.row(rowIdx).data().declarant_code,
                port: assessments_tbl.row(rowIdx).data().port,
                reg_year: assessments_tbl.row(rowIdx).data().reg_year,
                reg_serial: assessments_tbl.row(rowIdx).data().reg_serial,
                amount: assessments_tbl.row(rowIdx).data().amount,
                has_interest: assessments_tbl.row(rowIdx).data().has_interest,
                interest_amount: assessments_tbl.row(rowIdx).data().interest_amount,
                status: assessments_tbl.row(rowIdx).data().status
            }
            sum = sum+parseFloat(assessment.amount)+parseFloat(assessment.interest_amount)
            assessments.push(assessment)
        })
        return {assessments: assessments, count: assessments.length, amount: sum}
    }


    //Diasable column if status not ACTIVE
    assessments_tbl.on('user-select', function (e, dt, type, cell, originalEvent) {
      var status = assessments_tbl.row(originalEvent.target._DT_CellIndex.row).data()["status"]
      if ( status != "ACTIVE" ) {
        e.preventDefault();
      }
    });

    assessments_tbl.on('select', function (e, dt, type, indexes) {
        var selected_sum = get_selected_assessments().amount
        $('#total_amount').text(selected_sum);
    });

    assessments_tbl.on('deselect', function (e, dt, type, cell, originalEvent) {
        var selected_sum = get_selected_assessments().amount
        $('#total_amount').text(selected_sum);
    });

    //-----------------   Walkin fetc ---------------------
    $('#fetch_walkin_asmnts').on( 'click', function () {
        var agent_type = ($('.agent_type').is(":checked"))? "1" : "0"
        var tpin = $('#tpin_dcode').val();
        if(tpin !=""){
            assessments_tbl.on('preXhr.dt', function ( e, settings, data ) {
                data._csrf_token = $("#csrf").val();
            } );
            assessments_tbl.draw();
        }
        else{
            $('.error').text("Enter TPIN or declarant code");
        }
    });

    //------------------------------- VIEW ASSESSMENT DETAILS -----------------------------
    $('#assessment-dts').on('click', '.view_b', function(event) {
        var button = $(event.target);
        var asmnt = button.attr("data-asmnt")
        $('#breakdowns').DataTable({
            "serverSide": true,
            "responsive": true,
            "processing": true,
            'language': {
                'loadingRecords': '&nbsp;',
                processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> '
            },
            'ajax': {
                "type"   : "POST",
                "url"    : '/assessments/breakdown',
                "data"   : {
                    "_csrf_token": $("#csrf").val(),
                    "assessment": asmnt,
                },
                "dataSrc": function (data) {
                    if (data.error){
                        $('.error').text(data.error);
                    }else{
                        return data.data;
                    }
                }
            },
            "paging": false,
            "searching": false,
            "info": false,
            "columns": [
                {"data": "product_code"},
                {"data": "product_name"},
                {"data": "tax_code"},
                {"data": "tax_rate"},
                {"data": "tax_amount"},
            ],
            "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
            "order": [[1, 'asc']]
        });

    });
    //------------------------------------------------------------------------------------

    function formatAmount(amt) {
        return Number(amt).toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });
    }

    //---------------------- profile accounts --------------
    var tbl_profile_accs = $("#tbl_prof_acc").DataTable({
        "serverSide": true,
        "responsive": true,
        "processing": true,
        "language": {
            'loadingRecords': '&nbsp;',
            'processing': '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Bank connectivity or profile Accounts"
        },
        'ajax': {
            "type"   : "POST",
            "url"    : '/assessments/profile/accounts',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "currency": currency
            }
        },
        "paging": false,
        "searching": false,
        "info": false,
        "columns": [
            {
                "data": "",
                "render": function ( data, type, row ) {
                    return "<input type='radio' name='acc_num' data-balance='"+row.balance+"' class='prof_acc' value='"+row.account+"'>";
                }
            },
            {"data": "name"},
            {"data": "account"},
            {
                "data": "",
                "render": function (data, type, row) {
                    return formatAmount(row.balance);
                }
            }
        ],
        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
        "order": [[1, 'asc']],
        "fnDrawCallback": function() {
            $("input:radio[name=acc_num]").on("click", function(){
                document.getElementById("pay-assessment-button").style.display = "block";
            });
        }
    });

    //--------------------- Refresh prof accounts ------------------------
    $('#refresh_accs').on( 'click', function () {
        tbl_profile_accs.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.currency = currency;
        } );
        tbl_profile_accs.draw();
    });

    function formartStatus(status) {
        var stat = null;
        if(status == "COMPLETE"){
            stat = "<span class='text-success'>SUCCESS</span>";
        }else if((status == "PENDING_BANK_PAYMENT") || (status == "PENDING_SETTLEMENT")){
            stat = "<span class='text-primary'>PENDING BANK</span>";
        }else if((status == "FAILED_BANK_PAYMENT") || (status == "FAILED_NOTIFICATION")){
            stat = "<span class='text-danger'>FAILED</span>";
        }else if((status == "DROPPED") || (status == "DECLINED")){
            stat = "<span class='text-info'>"+status+"</span>";
        }else{
            stat = status
        }
        return stat;
    }





    //----------batch assessments------------
    var asmnt_batch_dt = $('#tbl_clients_batch_entries').DataTable({
        "responsive": true,
        "processing": true,
		'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> '
		},
		"serverSide": true,
		"paging": true,
        'ajax': {
			"type"   : "POST",
			"url"    : '/assessments/batch/list',
			"data"   : {
                "_csrf_token": $("#csrf").val(),
                "batch_id":  $('#tbl_clients_batch_entries').attr("data-batch_ref")
            }
        },
		"columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {"data": "type"},
            {"data": "tpin"},
            {"data": "port"},
            {"data": "reg_num"},
            {"data": "reg_year"},
            {"data": "reg_serial"},
            {"data": "amount"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartStatus(data)
                }
            },
            {
                "data": "id",
                "render": function ( data, type, row ) {
                    return "<div class='input-group'>"+
                            "<div class='input-group-prepend'>"+
                                "<span data-toggle='dropdown' aria-haspopup='true' aria-expanded='false'>"+
                                    "<button class='btn btn-outline-info btn-xs'>Options</button>"+
                                "</span>"+
                                "<div class='dropdown-menu'>"+
                                    "<a type='button' class='dropdown-item text-center' href='/assessment/client/breakdown?id="+ data +"'>"+
                                        "<i class='subheader-icon fal fa-eye'></i>"+
                                        "Tax Breakdown"+
                                    "</a>"+
                                "</div>"+
                            "</div>"+
                        "</div>";
                },
            },

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

    $('#tbl_clients_batch_entries').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = asmnt_batch_dt.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });

    //--------------------payment modal--------------
    $('#pay-assessment-button').on( 'click', function () {
        console.log(type)
        var selected_assessments = (type == "MISC" ? get_selected_misc() : get_selected_assessments())
        var acc = $("input[type='radio'][name='acc_num']:checked").val();
        var balance = $("input[type='radio'][name='acc_num']:checked").attr("data-balance");
        var chargeable = txn_chrg*selected_assessments.count

        if(!(selected_assessments.count==0)){
            var modal = $('#payment_summary')
            modal.find('.modal-body #count').text(selected_assessments.count);
            modal.find('.modal-body #account').text(acc);
            modal.find('.modal-body #amount').text(selected_assessments.amount);
            modal.find('.modal-body #charges_total').text(chargeable);
            modal.find('.modal-body #balance').text(balance);
            $('#payment_summary').modal('show');
        }
        else{
            Swal.fire(
                'Oops..',
                "select assessments",
                'error'
            )
        }
    });

    $('#proceed_payment').on( 'click', function (event) {
        var selected = get_selected_assessments();

        Swal.fire({
            title: 'Are you sure you want to pay for selected asssessments?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            $.blockUI();
            if (result.value) {
                $.ajax({
                    url: "/assessments/client/payment",
                    type: 'POST',
                    data: {
                        sub: $("#client").attr("data-sub"),
                        date_range: {from: from, to: to},
                        currency: currency,
                        assessments: selected.assessments,
                        amount: selected.amount,
                        account:  $("input[type='radio'][name='acc_num']:checked").val(),
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            console.log(result)
                            submission_response(result.data)
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
                    'Operation cancelled.',
                    'error'
                )
            }
        })
    });

    //---------------------display submission result -----------
    function submission_response(result){
        var modal = $('#payment_response')
        modal.find('.modal-body #successful').text(result.successful);
        modal.find('.modal-body #failed').text(result.failed);
        $('#errors').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: result.errors,
            columns: [
            {"data": "error"},
            {
                "data": "assessment",
                "render": function ( data, type, row ) {
                        return "Port: "+data.port+", Reg No: "+data.reg_num+", Reg serial: "+data.reg_serial;
                }
            }
            ]
        });
        $('#payment_response').modal('show');
    }

    //----------------------- TELLER PAYMENT SUBMISSION ---------------------------
    $('#teller_walkin_payment').on( 'click', function (event) {
        var selected_assessments = get_selected_assessments();
        var amount = selected_assessments.amount;
        var payer_details = {
            item_type: "ASSESSMENT",
            item_ref: "hfgfuieiuf",
            payer_name: $('#walkin_lname').val(),
            payer_nrc: $('#walkin_nrc').val(),
            payer_mobile: $('#walkin_mobile').val(),
            payer_email: $('#walkin_email').val(),
            payer_address: $('#walkin_address').val(),
            bank_item_ref: $('#walkin_bank_ref').val(),
            company_name: $('#walkin_company').val(),
            }

        Swal.fire({
            title: 'Proceed with payment?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result) {
                $.blockUI();
                $.ajax({
                    url: "/assessments/teller/pay",
                    type: 'POST',
                    data: {
                        assessments: selected_assessments.assessments,
                        payer: payer_details,
                        amount: amount,
                         _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            submission_response(result.data)
                        }else{
                            Swal.fire(
                                'Oops..',
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
                    'Operation cancelled.',
                    'error'
                )
            }
        })
    });

    $('.btn_approve_batch').on( 'click', function (event) {
        var btn = $(this);
        Swal.fire({
            title: 'Are you sure you want to approve batch?',
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
                    url: "/assessments/approve",
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        ref_id: $('#ref_id').val()
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
                        console.log(request);
                        console.log(msg);
                        console.log(error);
                        Swal.fire(
                            'Error:',
                            'Payment could not be approved. Please try again..',
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


    $('.btn_decline_batch').on( 'click', function (event) {
        var btn = $(this);
        Swal.fire({
            title: 'Are you sure you want to decline batch?',
            text: "You won't be able to revert this!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, decline!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/assessments/decline",
                    type: 'POST',
                    data: {
                        _csrf_token: $('#csrf').val(),
                        ref_id: $('#ref_id').val(),
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
                            'Error:',
                            'Payment could not be declined. Please try again..',
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

    //------------resend token---------
    $('.resend_token').on( 'click', function (event) {
        Swal.fire({
            title: 'Proceed to resend token?',
            text: "Resend approval token for this transaction",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/Smartpay/notifications/resend_token",
                    type: 'POST',
                    data: {
                        ref_id: $('#ref_id').val(),
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
                            'Error:',
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

    //--------------test service by pulling assessments by tpin--------------
    $('#fetch_transs').on( 'click', function () {

        $.ajax({
            url: '/assessments/client/reports',
            type: 'POST',
            data: {_csrf_token: $('#csrf').val(), from: $('#from_date').val(), to: $('#to_date').val()},
            success: function(result) {
                if (result.data){
                    $('#assess').DataTable({
                        "data": result.data,
                        "responsive": true,
                        "processing": true,
                        'language': {
                            'loadingRecords': '&nbsp;',
                            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> '
                        },
                        "paging": true,
                        "columns": [
                            {"data": "tpin"},
                            {"data": "reg_num"},
                            {"data": "reg_serial"},
                            {"data": "port"},
                            {"data": "port"},

                        ],
                        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
                        "order": [[1, 'asc']]

                    });

                } else {
                    console.log("----error----")
                }
            },
            error: function(request, msg, error) {
                console.log("error--------------------")
            }
        });
    });

    //------------------------------- CLIENT REPORT -----------------------------
    var tbl_reportss = $('#tbl_reportss').DataTable({
        "serverSide": true,
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        'ajax': {
            "type"   : "POST",
            "url"    : '/assessments/client/reports',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "type": $("#type").val(),
                "currency": $("#currency").val(),
                "reg_num": $("#reg_num").val(),
                "reg_year": $("#reg_year").val(),
                "reg_serial": $("#reg_serial").val(),
                "tpin": $("#tpin").val(),
                "from": $("#from").val(),
                "to": $("#to").val(),
                "status": $("#status").val()
            },
            "dataSrc": function (data) {
                if (data.error){
                    $('.error').text(data.error);
                }else{
                    return data.data;
                }
            }
        },
        "paging": true,
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {"data": "type"},
            {"data": "tpin"},
            {"data": "port"},
            {"data": "reg_num"},
            {"data": "reg_year"},
            {"data": "reg_serial"},
            {"data": "amount"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartStatus(data)
                }
            },
            {
                "data": "id",
                "render": function ( data, type, row ) {

                    if(row.status == "COMPLETE"){
                        return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
                        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                            '<a href="/assessments/client/reciept?id='+data+'" class="dropdown-item text-success">Reciept</a>'+
                            '<a href="/assessments/client/transaction/details?id='+data+'" class="dropdown-item text-info">View Details</a>'+
                            '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success approval_tray">Approval Audit Trail</a></div>'+
                        '</div>';
                    }
                    else{
                        return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
                        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                            '<a href="/assessments/client/transaction/details?id='+data+'" class="dropdown-item text-info">View Details</a>'+
                            '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success approval_tray">Approval Audit Trail</a></div>'+
                        '</div>';
                    }

                },
            },

        ],
        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
        "order": [[1, 'asc']]
    });



    
    $('#tbl_reportss tbody').on('click', '.approval_tray', function () {
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
    $(".pending_approval_modal").on("click", function(){
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


 });

    
    $('#tbl_reportss').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_reportss.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });

    $('#btn_clnt_asmnt_filter').on( 'click', function () {
        tbl_reportss.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.type = $('#type').val();
            data.currency = $('#currency').val();
            data.reg_num = $('#reg_num').val();
            data.reg_year = $('#reg_year').val();
            data.reg_serial = $('#reg_serial').val();
            data.tpin = $('#tpin').val();
            data.from = $('#from').val();
            data.to = $('#to').val();
            data.status = $('#status').val();
        } );
        $('#filter').modal('hide');
        tbl_reportss.draw();
    });


    
    $('#aw_client_excel').on( 'click', function (event) {
        $('#asycudareportSearchForm').attr('action', '/assessments/client/export/reports');
        $('#asycudareportSearchForm').attr('method', 'GET');
        $("#asycudareportSearchForm").submit();
    });



    $('#reload_table').on( 'click', function () {
		tbl_reportss.ajax.reload();
    });


    $('#fetch_trans').on( 'click', function () {
        if($("#from_date").val() == "" || $("#to_date").val() == ""){
            Swal.fire(
                'Oops..!',
                'Select Transaction Range!',
                'error'
            )
            return false;
        }

        var client = JSON.parse($("#client").val())

        tbl_client_report.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.from = $('#from_date').val();
            data.to = $('#to_date').val();
            data.company_id = client.company.txn_prof_id;
        } );
        tbl_client_report.draw();
    });


    //------------------RECIEPT--------------------------
     $('#tbl_reportss').on('click', '.aw_reciept', function() {
        var btn = $(this);
        var id = btn.attr("data-id")
        $.blockUI();
        $.ajax({
             url: "/assessments/reciept",
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
                     location.reload();
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
        var asmnt = result.data
        var txn_amount =  parseFloat(asmnt.amount)
        var modal = $('#aw_reciept')
        modal.find('.modal-body #tax_payer').text(asmnt.tax_payer);
        modal.find('.modal-body #Payment Date').text(asmnt.payment_date);
        modal.find('.modal-body #tpin').text(asmnt.tpin);
        modal.find('.modal-body #d_code').text(asmnt.declarant_code);
        modal.find('.modal-body #address').text(asmnt.payer_address);
        $('#aw_reciept').modal('show');
    }

    //-------------- Destroy datatable when modal closed----------
    $('#breakdown').on('hidden.bs.modal', function (event){
        $('#breakdowns').DataTable().clear().destroy();
    });

    $('#payment_response').on('hidden.bs.modal', function (event){
        $('#errors').DataTable().clear().destroy();
        location.reload();
    });

    var appr_tray = $('#approval-tray').DataTable({});

    ///############################ MISC ############################
    var misc_tbl = $('#misc_tbl').DataTable({
        "responsive": true,
        "processing": true,
        "select": {
            "style": 'multi'
        },
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Assessments"
        },
        "paging": true,
        "pageLength": 10,
        "serverSide": false,
        "columns": [
            {"data": ""},
            {"data": "reg_num"},
            {"data": "tpin"},
            {"data": "port"},
            {"data": "reg_year"},
            {"data": "reg_serial"},
            {"data": "amount"},
            {"data": "txn_code"},
            {"data": "txn_descript"},
            {"data": "status"}
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']],
        'columnDefs': [
            {
                targets: 0,
                defaultContent: '',
                orderable: false,
                className: 'select-checkbox select-enabled',
                createdCell:  function (td, cellData, rowData, row, col){
                    if (rowData.status != "ACTIVE" ) {
                        $(td).removeClass( 'select-enabled' );
                    } else {
                        $(td).addClass( 'select-enabled' );
                    }
                }
            }
        ],
        responsive: true,
        lengthChange: false,
        dom:
            "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
            "<'row'<'col-sm-12'tr>>" +
            "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>"
    });

    function populate_misc(data) {
        if (data.data.length == 0) {
            misc_tbl.context[0].oLanguage.sEmptyTable = "No Assessments Found...";
            misc_tbl.clear().draw();
        }
        else{
            misc_tbl.processing(false);
            misc_tbl.clear().draw();
            misc_tbl.rows.add(data.data);
            misc_tbl.columns.adjust().draw();
            document.getElementById("panel-2").style.display = "block";

            tbl_profile_accs.on('preXhr.dt', function ( e, settings, data ) {
                data._csrf_token = $("#csrf").val();
                data.currency = "ZMW";
            } );
            tbl_profile_accs.draw();
        }
        misc_tbl.processing(false);
    }

    //---------------- fetch client ---------
    $('#fetch_misc').on( 'click', function () {
        //var client = JSON.parse($("#client_tpin").val());
        //currency = $("#currency").val();
        //from = $("#from_asmnt").val();
        //to = $("#to_asmnt").val();

        misc_tbl.processing( true );
        $.blockUI();
        $.ajax({
            type: "POST",
            url: "/miscs/fetch",
            dataType: "json",
            timeout: 60000,//1 minute
            data: {
                _csrf_token: $("#csrf").val(),
            },
            success: function(data) {
                if(data.data){
                    populate_misc(data)
                }
                else{
                    Swal.fire(
                        'Oops..',
                        data.error,
                        'error'
                    )
                    misc_tbl.processing(false);
                }
            },
            error: function(request, msg, error) {
                $('.error').text(msg);
                misc_tbl.processing(false);
            }
        });

    });


        //Function to pull selected assessments
    function get_selected_misc(){
        var assessments =[];
        var sum = 0;

        misc_tbl.rows( { selected: true } ).every(function(rowIdx) {
            var assessment = {
                reg_num: misc_tbl.row(rowIdx).data().reg_num,
                tpin: misc_tbl.row(rowIdx).data().tpin,
                port: misc_tbl.row(rowIdx).data().port,
                reg_year: misc_tbl.row(rowIdx).data().reg_year,
                reg_serial: misc_tbl.row(rowIdx).data().reg_serial,
                amount: misc_tbl.row(rowIdx).data().amount,
                txn_code: misc_tbl.row(rowIdx).data().txn_code,
                txn_descript: misc_tbl.row(rowIdx).data().txn_descript,
                status: misc_tbl.row(rowIdx).data().status
            }
            sum = sum+parseFloat(assessment.amount)
            assessments.push(assessment)
        })
        type = "MISC"
        return {assessments: assessments, count: assessments.length, amount: sum}
    }


        //Diasable column if status not ACTIVE
        misc_tbl.on('user-select', function (e, dt, type, cell, originalEvent) {
          var me =misc_tbl.row(originalEvent.target._DT_CellIndex.row).data()["status"]
          if ( me != "ACTIVE" ) {
            e.preventDefault();
          }
        });



        misc_tbl.on('select', function (e, dt, type, indexes) {
            var selected_sum = get_selected_misc().amount
            $('#misc_total').text(selected_sum);
        });

        misc_tbl.on('deselect', function (e, dt, type, cell, originalEvent) {
            var selected_sum = get_selected_misc().amount
            $('#misc_total').text(selected_sum);
        });


        $('#misc_payment').on( 'click', function (event) {
            var selected = get_selected_misc();

            Swal.fire({
                title: 'Proceed with asssessment payment?',
                text: "You won't be able to revert this!",
                type: "warning",
                showCancelButton: true,
                confirmButtonColor: '#3085d6',
                cancelButtonColor: '#d33',
                confirmButtonText: 'Yes, continue!',
                showLoaderOnConfirm: true
                }).then((result) => {
                if (result.value) {
                    $.blockUI();
                    $.ajax({
                        url: "/assessments/misc/pay",
                        type: 'POST',
                        data: {
                            assessments: selected.assessments,
                            amount: selected.amount,
                            currency: "ZMW",
                            date_range: {from: "", to: ""},
                            account:  $("input[type='radio'][name='acc_num']:checked").val(),
                            _csrf_token: $('#csrf').val()
                        },
                        success: function(result) {
                            if (result.data){
                                Swal.fire(
                                    'Success',
                                    result.data,
                                    'success'
                                )
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
                        'Operation not performed :)',
                        'error'
                    )
                }
            })
        });


});
