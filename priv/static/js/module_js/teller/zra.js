$(document).ready(function() {
    
    //=================================    assessments    ====================================

    jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
        return this.iterator( 'table', function ( ctx ) {
            ctx.oApi._fnProcessingDisplay( ctx, show );
        } );
    } );

 
   
    var currency = "";
    var tbl_teller_prn = $('#tbl_zra_teller_prn').DataTable({
        "responsive": true,
        "processing": true,
        "select": {
            "style": 'multi'
        },
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No PRN's"
        },
        "paging": true,
        "pageLength": 10,
        "serverSide": false,
        "columns": [
            {"data": ""},
            {"data": "prn"},
            {"data": "prn_type"},
            {"data": "currency_code"},
            {"data": "tax_payer_tpin"},
            {"data": "agent_tpin"},
            {"data": "tax_payer_name"},
            {"data": "total_amount"},
            {"data": "prn_date"},
            {
                "data": "prn_status",
                "render": function (data, type, row) {
                    return formartStatus(data)
                }
            },
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
                    if (rowData.prn_status != "GENERATED" ) {
                        $(td).removeClass( 'select-enabled' );
                    } else {
                        $(td).addClass( 'select-enabled' ); 
                    }
                }  
            },
            {
                'targets': 10,
                "className": "btn_tbreakdown",
                "render": function (data, type, row) {
                    return '<button class="btn btn-xs btn-pills waves-effect waves-themed" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Breakdown</button>';
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
        dom:'Bfrtip',
        buttons: [ 
            {
                 extend: 'selectAll',
                 action: function() {
                    tbl_teller_prn.rows(function ( idx, data, node ) {
                        return data['prn_status'] === 'GENERATED'? true: false;
                    }).select();
                 }
            },
                 'selectNone',
            {
                extend: 'excelHtml5',
                exportOptions: {
                    columns: [ 1, 2, 3, 5, 6, 7, 8, 9]
                }
            }
        ]
    });


    function populate_prns(currency, data) {
        if (data.length == 0) {
            tbl_teller_prn.context[0].oLanguage.sEmptyTable = "No PRN's Found...";
            tbl_teller_prn.clear().draw();
        }
        else{
            tbl_teller_prn.processing(false);
            tbl_teller_prn.clear().draw();
            tbl_teller_prn.rows.add(data);
            tbl_teller_prn.columns.adjust().draw();
        }
        tbl_teller_prn.processing(false);  
    }

    //---------------- fetch client ---------
    var from = "";
    var to = "";
    var cust_chrg = "";
    var domt_chrg = "";
    $('#fetch_teller_prn').on( 'click', function () {
        tpin = $("#tpin").val();
        from = $("#from_prn").val();
        to = $("#to_prn").val();

        if(tpin){
            tbl_teller_prn.processing( true );

            $.ajax({
                type: "POST",
                url: "/Teller/zra/prn/fetch",
                dataType: "json",
                timeout: 60000,//1 minute
                data: {
                    _csrf_token: $("#csrf").val(),
                    tpin: tpin,
                    type: $("#type").val(),
                    prn_type: $("#prn_type").val(),
                    currency: "ZMW",
                    from: from,
                    to: to
                },
                success: function(result) {
                    if(result.data){
                        cust_chrg = parseFloat(result.data.cust_chrg);
                        domt_chrg = parseFloat(result.data.domt_chrg);
                        populate_prns(currency, result.data.prns)
                    }
                    else{
                        Swal.fire(
                            'Oops..',
                            result.error,
                            'error'
                        )
                        tbl_teller_prn.processing(false);
                    }
                },
                error: function(request, msg, error) {
                    $('.error').text(msg);
                    tbl_teller_prn.processing(false);
                }
            });

        }
        else{
            tbl_teller_prn.processing(false);
            Swal.fire(
                'Oops..',
                "Kindly Enter TPIN",
                'error'
            ) 
        }
    });


    //Function to pull selected assessments
    function get_selected_prns(){
        var prns =[];
        var sum = 0;

        tbl_teller_prn.rows( { selected: true } ).every(function(rowIdx) {
            var prn = {
                prn: tbl_teller_prn.row(rowIdx).data().prn,
                payer_tpin: tbl_teller_prn.row(rowIdx).data().tax_payer_tpin,
                agent_tpin: tbl_teller_prn.row(rowIdx).data().agent_tpin,
                prn_date: tbl_teller_prn.row(rowIdx).data().prn_date,
                prn_type: tbl_teller_prn.row(rowIdx).data().prn_type,
                amount: tbl_teller_prn.row(rowIdx).data().total_amount,
                currency: tbl_teller_prn.row(rowIdx).data().currency_code,
                zra_prn_status: tbl_teller_prn.row(rowIdx).data().prn_status,
                tax_payer_name: tbl_teller_prn.row(rowIdx).data().tax_payer_name,
                narration: tbl_teller_prn.row(rowIdx).data().narration,
                rcpt_no: tbl_teller_prn.row(rowIdx).data().reciept_number,
                rcpt_date: tbl_teller_prn.row(rowIdx).data().reciept_date,
                breakdown: tbl_teller_prn.row(rowIdx).data().breakdown
            }
            sum = sum+parseFloat(prn.amount)
            prns.push(prn)
        })
        return {prns: prns, count: prns.length, amount: sum}
    }


    //Diasable column if status not ACTIVE
    tbl_teller_prn.on('user-select', function (e, dt, type, cell, originalEvent) {
      var status = tbl_teller_prn.row(originalEvent.target._DT_CellIndex.row).data()["prn_status"]
      if ( status != "GENERATED" ) {
        e.preventDefault();
      }
    });

    $(".selectAll").on( "click", function(e) {
        if ($(this).is( ":checked" )) {
            tbl_teller_prn.rows().select();        
        } else {
            tbl_teller_prn.rows().deselect(); 
        }
    });

    tbl_teller_prn.on('select', function (e, dt, type, indexes) {
        var selected_sum = get_selected_prns().amount
        display_pay_button(selected_sum)
        $('#total_amount').text(selected_sum);
    });

    tbl_teller_prn.on('deselect', function (e, dt, type, cell, originalEvent) {
        var selected_sum = get_selected_prns().amount
        display_pay_button(selected_sum)
        $('#total_amount').text(selected_sum);
    });

    function display_pay_button(amount){
        if(amount > 0){
            document.getElementById("btn_teller_proceed").style.display = "block";
        } else {
            document.getElementById("btn_teller_proceed").style.display = "none";
        }
    }

    $('#tbl_zra_teller_prn').on('click', 'td.btn_tbreakdown', function () {
		var tr = $(this).closest('tr');
		var row = tbl_teller_prn.row(tr);
        var data = row.data();
        prn_tax_breakdown(data.breakdown);  
	});


    function prn_tax_breakdown(data){
        $('#tbl_prn_breakdown').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: data,
            columns: [
            {"data": "tax_code"},
            {"data": "amount"},
            ]
        });
        $('#prn_breakdown_modal').modal('show');
    }

    //-------------- Destroy datatable when modal closed----------
    $('#prn_breakdown_modal').on('hidden.bs.modal', function (event){
        $('#tbl_prn_breakdown').DataTable().clear().destroy();
    });


    //==================== payment btn ===========================btn_teller_paymnt
    //--------------------payment modal--------------
    $('#teller_proceed_payment').on( 'click', function () {
        var form = $("#teller_kyc_form");
        $.blockUI();
        $.ajax({
            url: "/Teller/zra/prn/payment",
            type: 'POST',
            data: {
                _csrf_token: $('#csrf').val(),
                client: getFormData(form),
                prns: get_selected_prns(),
                type: $("#prn_type").val()
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

    function calc_charge(selec_prns){
        var domt_count = 0;
        var cust_count = 0;
        var total_cust_chrg = 0;
        var total_domt_chrg = 0;
        var total_chrg = 0;
        selec_prns.prns.every(function(prn) {
            if (prn.prn_type == "CUST"){
                total_chrg += cust_chrg;
                total_cust_chrg++;
            } else{
                total_chrg += domt_chrg;
                total_domt_chrg++;
            }
        })
        return total_chrg; 
    }

    $("#teller_kyc_form").on('submit', function(e){
        e.preventDefault();
        $('#modal_teller_kyc').modal('hide');

        var selected_prns = get_selected_prns()
        var amount = parseFloat(selected_prns.amount);
        var chargeable = calc_charge(selected_prns);
        var total_amount = amount+chargeable;

        var modal = $('#teller_payment_summary')
        modal.find('.modal-body #count').text(selected_prns.count);
        modal.find('.modal-body #amount').text(selected_prns.amount);
        modal.find('.modal-body #charges_total').text(chargeable);
        $('#teller_payment_summary').modal('show');

    });

    function getFormData(form){
        var unindexed_array = form.serializeArray();
        var indexed_array = {};
    
        $.map(unindexed_array, function(n, i){
            indexed_array[n['name']] = n['value'];
        });
    
        return indexed_array;
    }



    //============================= REPORT ===============================

    var tbl_zra_teller_report = $('#tbl_zra_teller_report').DataTable({
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
        "url"    : '/zra/teller/prns/reports',
        "data"   : {
            "_csrf_token": $("#csrf").val(),
            "status": $("#filter_status").val(),
            "type": $("#filter_prn_type").val(),
            "prn": $("#filter_prn").val(),
            "payer_tpin": $("#filter_tpin").val(),
            "from": $("#filter_from").val(),
            "to": $("#filter_to").val()
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
        {"data": "prn_type"},
        {"data": "tax_payer_name"},
        {"data": "tax_payer_tpin"},
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
                    return '<button class="btn btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important; background-color: #FFD5AD; color: #C02629;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" class="dropdown-item text-info view_kyc">KYC</a>'+
                        '<a href="#" data-prn_id="'+data+'" class="dropdown-item text-info prn_breakdown">Breakdown</a>'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a>'+
                    '</div>';
                }
                else{
                    return '<button class="btn btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important; background-color: #FFD5AD; color: #C02629;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-info view_kyc">KYC</a>'+
                        '<a href="#" data-prn_id="'+data+'" class="dropdown-item text-info prn_breakdown">Breakdown</a>'+
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

    $('#tbl_zra_teller_report').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_zra_teller_report.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });

    $('#tbl_zra_teller_report').on('click', '.prn_breakdown', function () {
        var btn = $(this);
        //$.blockUI();
        $.ajax({
            url: "/zra/client/prn/breakdown",
            type: 'POST',
            data: {
                prn_id: btn.attr("data-prn_id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    prn_tax_breakdown(result.data);
                } else {
                    Swal.fire(
                        'Oops',
                        "error on getting the breakdown",
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

    $('#btn_zra_teller_filter').on( 'click', function () {
        tbl_zra_teller_report.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.payer_tpin = $('#filter_tpin').val();
            data.prn = $('#filter_prn').val();
            data.type = $('#filter_prn_type').val();
            data.status = $('#filter_status').val();
            data.from = $('#filter_from').val();
            data.to = $('#filter_to').val();  
        } );
        $('#filter').modal('hide');
        tbl_zra_teller_report.draw();
    });

    $('#reload_table').on( 'click', function () {
        tbl_zra_teller_report.ajax.reload();
    });

    //------------------ KYC --------------------------
    $('#tbl_zra_teller_report').on('click', '.view_kyc', function() {
        var btn = $(this);
        var ref_id = btn.attr("data-ref_id")
        //$.blockUI();
        $.ajax({
            url: "/report/kyc",
            type: 'POST',
            data: {
                ref_id: ref_id, 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    kyc_modal(result.data)
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

    $('#tbl_zra_teller_report').on('click', '.prn_breakdown', function () {
        var btn = $(this);
        //$.blockUI();
        $.ajax({
            url: "/zra/client/prn/breakdown",
            type: 'POST',
            data: {
                prn_id: btn.attr("data-prn_id"), 
                _csrf_token: $('#csrf').val()
            },
            success: function(result) {
                if (result.data){
                    prn_tax_breakdown(result.data);
                } else {
                    Swal.fire(
                        'Oops',
                        "error on getting the breakdown",
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

    $('#tbl_customs_client_prn').on('click', 'td.prn_breakdown', function () {
		var tr = $(this).closest('tr');
		var row = tbl_client_prn.row(tr);
        var data = row.data();
        prn_tax_breakdown(data.breakdown);  
	});


    function prn_tax_breakdown(data){
        $('#tbl_prn_breakdown').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: data,
            columns: [
            {"data": "tax_code"},
            {"data": "amount"},
            ]
        });
        $('#prn_breakdown_modal').modal('show');
    }




    function formartStatus(status) {
        var stat = null;
        if(status == "COMPLETE"){
            stat = "<span class='text-success'>SUCCESS</span>";
        }else if(status == "GENERATED"){
            stat = "<span class='text-primary'>GENERATED</span>";
        }else if(status == "PENDING_BANK_PAYMENT"){
            stat = "<span class='text-info'>PENDING BANK PAYMENT</span>";
        }else if(status == "PENDING_NOTIFICATION"){
            stat = "<span class='text-info'>PENDING NOTIFICATION</span>";
        }else if((status == "FAILED_PAYMENT") || (status == "FAILED_NOTIFICATION")){
            stat = "<span class='text-danger'>FAILED</span>";
        }else if((status == "DROPPED") || (status == "DECLINED")){
            stat = "<span class='text-info'>"+status+"</span>";
        }else if(status == "PENDING_APPROVAL"){
            stat = "<span class='text-primary'>PENDING APPROVAL</span>";
        }else{
            stat = status
        }
        return stat;
    }


    function formatSearchDetails ( a ) {
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>Tax Payer Name: '+format_value(a.tax_payer_name)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Agent TPIN: '+format_value(a.agent_tpin)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Transaction Charge: '+format_value(a.charge_amount)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Debit account: '+format_value(a.dr_acc)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date initiated: '+format_value(a.initiator_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date Approved: '+format_value(a.approver_date)+'</td>'+
            '</tr>'+
        '</table>';
    }



    //------------------RECIEPT-------------------------
    $('#tbl_client_zra_prn').on('click', '.reciept', function() {
        var btn = $(this);
        var id = btn.attr("data-id")
            $.ajax({
                url: "/zra/prn/reciept",
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
    
 

    $('#export_excel').on( 'click', function (event) {
        $('#reportSearchForm').attr('action', '/zra/admin/excel');
        $('#reportSearchForm').attr('method', 'GET');
        $("#reportSearchForm").submit();
    });

    
    //-------------- Destroy datatable when modal closed----------
    $('#breakdown').on('hidden.bs.modal', function (event){
        $('#breakdowns').DataTable().clear().destroy();
    });

});