$(document).ready(function() {
    $(document).ajaxStop($.unblockUI);
    
    //=================================    assessments    ====================================

    jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
        return this.iterator( 'table', function ( ctx ) {
            ctx.oApi._fnProcessingDisplay( ctx, show );
        } );
    } );

    $.fn.dataTable.render.ellipsis = function ( cutoff, wordbreak, escapeHtml ) {
		var esc = function ( t ) {
			return t
				.replace( /&/g, '&amp;' )
				.replace( /</g, '&lt;' )
				.replace( />/g, '&gt;' )
				.replace( /"/g, '&quot;' );
		};
	 
		return function ( d, type, row ) {
			// Order, search and type get the original data
			if ( type !== 'display' ) {
				return d;
			}
	 
			if ( typeof d !== 'number' && typeof d !== 'string' ) {
				return d;
			}
	 
			d = d.toString(); // cast numbers
	 
			if ( d.length < cutoff ) {
				return d;
			}
	 
			var shortened = d.substr(0, cutoff-1);
	 
			// Find the last white space character in the string
			if ( wordbreak ) {
				shortened = shortened.replace(/\s([^\s]*)$/, '');
			}
	 
			// Protect against uncontrolled HTML input
			if ( escapeHtml ) {
				shortened = esc( shortened );
			}
	 
			return '<span class="ellipsis" title="'+esc(d)+'">'+shortened+'&#8230;</span>';
		};
	};

 
   
    var currency = "";
    var tbl_client_prn = $('#tbl_customs_client_prn').DataTable({
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
            }
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
                "className": "prn_breakdown",
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
                    tbl_client_prn.rows(function ( idx, data, node ) {
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
            tbl_client_prn.context[0].oLanguage.sEmptyTable = "No PRN's Found...";
            tbl_client_prn.clear().draw();
        }
        else{
            tbl_client_prn.processing(false);
            tbl_client_prn.clear().draw();
            tbl_client_prn.rows.add(data);
            tbl_client_prn.columns.adjust().draw();
            document.getElementById("panel-2").style.display = "block";

            tbl_profile_accs.on('preXhr.dt', function ( e, settings, data ) {
                data._csrf_token = $("#csrf").val(); 
                data.currency = currency;
            } );
            tbl_profile_accs.draw();
        }
        tbl_client_prn.processing(false);  
    }

    //---------------- fetch client ---------
    var from = "";
    var to = "";
    var cust_chrg = "";
    var domt_chrg = "";
    $('#fetch_client_prn').on( 'click', function () {
        currency = $("#currency").val();
        from = $("#from_prn").val();
        to = $("#to_prn").val();

        if(currency){
            tbl_client_prn.processing( true );

            $.ajax({
                type: "POST",
                url: "/zra/client/prns/fetch",
                dataType: "json",
                timeout: 60000,//1 minute
                data: {
                    _csrf_token: $("#csrf").val(),
                    prn_type: $("#prn_type").val(),
                    currency: currency,
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
                        tbl_client_prn.processing(false);
                    }
                },
                error: function(request, msg, error) {
                    $('.error').text(msg);
                    tbl_client_prn.processing(false);
                }
            });

        }
        else{
            tbl_client_prn.processing(false);
            Swal.fire(
                'Oops..',
                "Kindly select currency",
                'error'
            ) 
        }
    });


    //Function to pull selected assessments
    function get_selected_prns(){
        var prns =[];
        var sum = 0;

        tbl_client_prn.rows( { selected: true } ).every(function(rowIdx) {
            var prn = {
                prn: tbl_client_prn.row(rowIdx).data().prn,
                payer_tpin: tbl_client_prn.row(rowIdx).data().tax_payer_tpin,
                agent_tpin: tbl_client_prn.row(rowIdx).data().agent_tpin,
                prn_date: tbl_client_prn.row(rowIdx).data().prn_date,
                prn_type: tbl_client_prn.row(rowIdx).data().prn_type,
                amount: tbl_client_prn.row(rowIdx).data().total_amount,
                currency: tbl_client_prn.row(rowIdx).data().currency_code,
                zra_prn_status: tbl_client_prn.row(rowIdx).data().prn_status,
                tax_payer_name: tbl_client_prn.row(rowIdx).data().tax_payer_name,
                narration: tbl_client_prn.row(rowIdx).data().narration,
                rcpt_no: tbl_client_prn.row(rowIdx).data().reciept_number,
                rcpt_date: tbl_client_prn.row(rowIdx).data().reciept_date,
                breakdown: tbl_client_prn.row(rowIdx).data().breakdown
            }
            sum = sum+parseFloat(prn.amount)
            prns.push(prn)
        })
        return {prns: prns, count: prns.length, amount: sum}
    }


    //Diasable column if status not ACTIVE
    tbl_client_prn.on('user-select', function (e, dt, type, cell, originalEvent) {
      var status = tbl_client_prn.row(originalEvent.target._DT_CellIndex.row).data()["prn_status"]
      if ( status != "GENERATED" ) {
        e.preventDefault();
      }
    });

    $(".selectAll").on( "click", function(e) {
        if ($(this).is( ":checked" )) {
            tbl_client_prn.rows().select();        
        } else {
            tbl_client_prn.rows().deselect(); 
        }
    });

    tbl_client_prn.on('select', function (e, dt, type, indexes) {
        var selected_sum = get_selected_prns().amount
        $('#total_amount').text(selected_sum);
    });

    tbl_client_prn.on('deselect', function (e, dt, type, cell, originalEvent) {
        var selected_sum = get_selected_prns().amount
        $('#total_amount').text(selected_sum);
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

    //-------------- Destroy datatable when modal closed----------
    $('#prn_breakdown_modal').on('hidden.bs.modal', function (event){
        $('#tbl_prn_breakdown').DataTable().clear().destroy();
    });

    //--------------------payment modal--------------
    var total_amount = null;
    $('#btn_pay_prns').on( 'click', function () {
        var selected_prns = get_selected_prns()
        var acc = $("input[type='radio'][name='acc_num']:checked").val();
        var balance = $("input[type='radio'][name='acc_num']:checked").attr("data-balance");

        var amount = parseFloat(selected_prns.amount);
        var chargeable = calc_charge(selected_prns);
        total_amount = amount+chargeable;

        if(!(selected_prns.count==0)){
            var modal = $('#payment_summary')
            modal.find('.modal-body #count').text(selected_prns.count);
            modal.find('.modal-body #account').text(acc);
            modal.find('.modal-body #amount').text(selected_prns.amount);
            modal.find('.modal-body #charges_total').text(chargeable);
            modal.find('.modal-body #balance').text(balance); 
            $('#payment_summary').modal('show');
        }
        else{
            Swal.fire(
                'Oops..',
                "select PRN's",
                'error'
            ) 
        }
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
            "url"    : '/zra/client/prns/accounts',
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
                    return "<input type='radio' name='acc_num' data-brn='"+row.branch_code+"' data-balance='"+row.balance+"' class='prof_acc' value='"+row.account+"'>";
                }
            },
            {"data": "name"},
            {"data": "account"},
            {"data": "branch_code"},
            {"data": "balance"}
        ],
        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
        "order": [[1, 'asc']],
        "fnDrawCallback": function() {
            $("input:radio[name=acc_num]").on("click", function(){
                document.getElementById("btn_pay_prns").style.display = "block";
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


    $('#proceed_payment').on( 'click', function (event) {
        var selected = get_selected_prns();
        var acc_radio = $("input[type='radio'][name='acc_num']:checked")

        Swal.fire({
            title: "Are you sure you want to pay for selected PRN's?",
            text: "You won't be able to revert this!",
            type: "info",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/zra/client/prns/payment",
                    type: 'POST',
                    data: {
                        date_range: {from: from, to: to},
                        currency: currency,
                        prns: selected.prns, 
                        amount: total_amount, 
                        account: acc_radio.val(),
                        acc_brn: acc_radio.attr("data-brn"),
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            var resp = result.data;
                            if(resp.errors.length == 0){
                                Swal.fire(
                                    'Success',
                                    resp.successful+" PRN(s) Processed Successfully!",
                                    'success'
                                ).then(function(){ 
                                    location.reload();
                                    }
                                );
                            }else{
                                submission_response(resp) 
                            }
                        } else {
                            Swal.fire(
                                result.error,
                                '',
                                'error'
                            )
                        }
                    },
                    error: function(request, msg, error) {
                        Swal.fire(
                            'Something went wrong! try again..',
                            '',
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
            columns: [{"data": "prn"},{"data": "error"}]
        });
        $('#payment_response').modal('show');
    }



var tbl_zra_client_txns = $('#tbl_client_zra_prn').DataTable({
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
        "url"    : '/zra/client/prns/reports',
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
        {"data": "currency"},
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
                    return '<button class="btn btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="/zra/client/prn/details?id='+ data +'" class="dropdown-item text-info">View Details</a>'+
                        // '<a href="/zra/prn/reciept?id='+data+'" data-id="'+data+'" class="dropdown-item text-success">Reciept</a>'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a>'+
                        '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success approval_tray">Approval Audit Trail</a></div>'+
                    '</div>';
                }
                else{
                    return '<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
                    '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-info details">View Details</a>'+
                        '<a href="#" data-id="'+data+'" class="dropdown-item text-danger aw_drop_payment">Drop Payment</a>'+
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

    
    $('#tbl_client_zra_prn tbody').on('click', '.approval_tray', function () {
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

    //---------------- Client report approval trail details modal ----------------
    function approval_trial_modal(workflow){
        $('#traild').DataTable( {
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
                    "render": function (data, type, row) {
                           if(data == 'APPROVED'){
                            return '<span class="label text-success">'+data+'</span>';
                        } else if (data=='PENDING_APPROVAL') {
                            return '<span class="label text-info">'+data+'</span>';
                        } else{
                            return '<span class="label text-danger">'+data+'</span>';
                        }
                    }
                }
            ]
        });
        $('#approval_trial_modal').modal('show');
    }

    $('#approval_trial_modal').on('hidden.bs.modal', function (event){
        $('#trail').DataTable().clear().destroy();
    });


    

    $('#tbl_client_zra_prn').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_zra_client_txns.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });

    // ------------------ DROP PAYMENT ------------------//
    //


    $('#tbl_client_zra_prn').on('click', '.aw_drop_payment', function() {
        var btn = $(this);
        var id = btn.attr("data-id");

        Swal.fire({
            title: 'Are you sure you want to drop Payment?',
            text: "Proceed to drop payment",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/zra/drop/payment",
                    type: 'POST',
                    data: {
                        id: id, 
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
                            'Drop Operation not successful!!, try again..',
                            '',
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


   
    //------------------Domt client transactions report table--------------------- 
    $('#btn_zra_client_filter').on( 'click', function () {
        tbl_zra_client_txns.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.payer_tpin = $('#filter_tpin').val();
            data.prn = $('#filter_prn').val();
            data.type = $('#filter_prn_type').val();
            data.status = $('#filter_status').val();
            data.from = $('#filter_from').val();
            data.to = $('#filter_to').val();  
        } );
        $('#filter').modal('hide');
        tbl_zra_client_txns.draw();
    });


    var tbl_zra_prn_entries = $('#tbl_client_zra_entries').DataTable({
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
            "url"    : '/zra/client/entries',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "ref_id": $("#ref_id").val(),
            }
        },
        "columns": [
            {
                "className": 'details-control',
                "orderable": false,
                "data": null,
                "defaultContent": ''
            },
            {"data": "prn"},
            {"data": "prn_type"},
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
            {"data": "currency"},
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
                    return '<button class="btn btn-xs btn-pills waves-effect waves-themed prn_breakdown" data-prn_id="'+data+'" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Breakdown</button>';
                }
            } 
        ], 
        "columnDefs": [
            {
                "targets": 8,
                "className": "text-center",
                "width": "4%"
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
    
        $('#tbl_client_zra_entries').on('click', 'td.details-control', function () {
            var tr = $(this).closest('tr');
            var row = tbl_zra_prn_entries.row(tr);
    
            if (row.child.isShown()) {
                row.child.hide();
                tr.removeClass('shown');
            }
            else {
                row.child(formatSearchDetails(row.data())).show();
                tr.addClass('shown');
            }
        });

        $('#tbl_client_zra_entries').on('click', '.prn_breakdown', function () {
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
            stat = "<span class='text-danger'>PENDING BANK VERIFICATION</span>";
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


    $('#btn_approve_zra_prns').on( 'click', function (event) {

        Swal.fire({
            title: 'Are you sure you want to approve PRN?',
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
                    url: "/zra/client/approve",
                    type: 'POST',
                    data: {
                        ref_id: $('#batch_ref_id').val(), 
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
                $.unblockUI();
            } else {
                Swal.fire(
                    'Cancelled',
                    'Operation not performed :)',
                    'error'
                )
            }
        })
    });


    $('#btn_decline_zra_prns').on( 'click', function (event) {

        Swal.fire({
            title: 'Are you sure you want to decline PRN?',
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
                    url: "/zra/client/decline",
                    type: 'POST',
                    data: {
                        ref_id: $('#d_batch_ref_id').val(), 
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
                    'Operation not performed :)',
                    'error'
                )
            }
        })
    });


    //------------------RECIEPT-------------------------
    $('#tbl_client_zra_prn').on('click', '.reciept', function() {
        var btn = $(this);
        var id = btn.attr("data-id")
            $.ajax({
                url: "/zra/client/prn/reciept",
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
        console.log("9999999999999999999999999")
        console.log(result)
        var txn_amount =  formartAmount(prn.amount)
        var modal = $('#prn_reciept')
        modal.find('.modal-body #tax_payer').text(prn.tax_payer_name);
        modal.find('.modal-body #Payment_date').text(prn.rcpt_date);
        modal.find('.modal-body #Prn_date').text(prn.prn_date);
        modal.find('.modal-body #tpin').text(prn.tax_payer_tpin);
        modal.find('.modal-body #agent_tpin').text(prn.agent_tpin);
        modal.find('.modal-body #prn').text(prn.prn);
        modal.find('.modal-body #prn_type').text(prn.prn_type);
        modal.find('.modal-body #address').text("123 Cairo RD Lusaka");
        modal.find('.modal-body #bank_ref').text(prn.currency);
        modal.find('.modal-body #prn_amount').text(txn_amount);
        modal.find('.modal-body #rcpt_no').text(prn.rcpt_no);
        modal.find('.modal-body #rcpt_date').text(prn.rcpt_date);
        modal.find('.modal-body #narration').text(prn.narration);
        modal.find('.modal-body #reg_num').text(prn.reg_num);
        modal.find('.modal-body #reg_serial').text(prn.reg_serial);
        modal.find('.modal-body #reg_year').text(prn.reg_year);
        modal.find('.modal-body #tax_code').text(prn.tax_code);
        modal.find('.modal-body #amount_words').text(prn.amount_words);
        add_breakdown_rcpt(prn.breakdown)

        $('#prn_reciept').modal('show');
    }

    function add_breakdown_rcpt(breakdown){
        var tabt = document.getElementById('judy').getElementsByTagName('tbody')[0];
        $.each(breakdown, function(k, v) {

            var row = tabt.insertRow(1);
            var cell1 = row.insertCell(0);
            var cell2 = row.insertCell(1);
            var cell3 = row.insertCell(2);
            var cell4 = row.insertCell(3);
            var cell5 = row.insertCell(4);
            var cell6 = row.insertCell(5);
            cell5.innerHTML = v.tax_code; 
            cell6.innerHTML = v.amount; 
        });  
    }

    $('#prn_reciept').on('hidden.bs.modal', function (event){
        location.reload();
    });


    

        // ---------------------- user -------------------------------
	var $user = $('#user-table').DataTable({
		"scrollX": false,
		// "scrollY": "50vh",
        "scrollCollapse": true,
		"paging": true,
		"bInfo" : true,
		dom: 'lBfrtip<"actions">',
		buttons: [
			{
				extend:    'copyHtml5',
				text:      '<i class="fa fa-files-o"></i>',
				titleAttr: 'Copy'
			},
			{
				extend:    'excelHtml5',
				text:      '<i class="fa fa-file-excel-o"></i>',
				titleAttr: 'Excel'
			},
			{
				extend:    'csvHtml5',
				text:      '<i class="fa fa-file-text-o"></i>',
				titleAttr: 'CSV'
			},
			{
				extend:    'pdfHtml5',
				text:      '<i class="fa fa-file-pdf-o"></i>',
				titleAttr: 'PDF'
			},
			{
				extend:    'print',
				text:      '<i class="fa fa-print"></i>',
				titleAttr: 'Print'
			},
		 ],
		columnDefs: [
			{
				targets: [0, 1, 3],
				render: $.fn.dataTable.render.ellipsis( 15, true, true)
			},{
				targets: 2,
				render: $.fn.dataTable.render.ellipsis( 27, true, true)
			},{
				targets: [4, 5],
				width: 20
			}
		]
	});
    
    

    $('#client_export_excel').on( 'click', function (event) {
        $('#reportSearchForm').attr('action', '/zra/client/excel');
        $('#reportSearchForm').attr('method', 'GET');
        $("#reportSearchForm").submit();
    });


    $('#reload_table').on( 'click', function () {
        tbl_zra_client_txns.ajax.reload();
    });

    
    //-------------- Destroy datatable when modal closed----------
    $('#breakdown').on('hidden.bs.modal', function (event){
        $('#breakdowns').DataTable().clear().destroy();
    });
 

    $('#payment_response').on('hidden.bs.modal', function (event){
        $('#errors').DataTable().clear().destroy();
        location.reload(true);
    });

    $('#approval-tray').DataTable({});  
    
    








    // //================================ GENERATE PRN =============================
    // var tbl_client_taxes = $('#tbl_domt_client_tax_types').DataTable({
    //     "responsive": true,
    //     "processing": true,
    //     "select": {
    //         "style": 'single'
    //     },
    //     'language': {
    //         'loadingRecords': '&nbsp;',
    //         processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
    //         "emptyTable": "No PRN's"
    //     },
    //     "paging": true,
    //     "pageLength": 10,
    //     "serverSide": false,
    //     "columns": [
    //         {"data": ""},
    //         {"data": "tax_type_code"},
    //         {"data": "tax_type_name"},
    //         {"data": "edr"},
    //         {"data": "edr"}
    //     ],
    //     "lengthMenu": [[10, 25, 50], [10, 25, 50]],
    //     "order": [[1, 'asc']],
    //     'columnDefs': [
    //         {
    //             targets: 0,
    //             defaultContent: '',
    //             orderable: false,
    //             className: 'select-checkbox',
    //             createdCell:  function (td, cellData, rowData, row, col){
    //                 $(td).addClass( 'select-enabled' );
    //             }  
    //         },
    //         {
    //             "targets": 2,
    //             "className": "text-center"
    //         },
    //         {
    //             'targets': 4,
    //             "className": "btn_tax_liabilities",
    //             "render": function (data, type, row) {
    //                 return '<button class="btn btn-xs btn-pills waves-effect waves-themed" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Liabilities</button>';
    //             }
    //         }
    //     ],
    //     lengthChange: true,
    //     dom:'Bfrtip'
    // });


    // function populate_taxes(data) {
    //     if (data.length == 0) {
    //         tbl_client_taxes.context[0].oLanguage.sEmptyTable = "No DOMT Taxes Found...";
    //         tbl_client_taxes.clear().draw();
    //     }
    //     else{
    //         tbl_client_taxes.processing(false);
    //         tbl_client_taxes.clear().draw();
    //         tbl_client_taxes.rows.add(data);
    //         tbl_client_taxes.columns.adjust().draw();
    //     }
    //     tbl_client_taxes.processing(false);  
    // }

    // //---------------- fetch taxes ---------
    // $('#fetch_client_tax_types').on( 'click', function () {
    //     var tpin = $("#client_tpin").val();

    //     if(tpin){
    //         tbl_client_taxes.processing( true );

    //         $.ajax({
    //             type: "POST",
    //             url: "/zra/client/taxes/fetch",
    //             dataType: "json",
    //             timeout: 60000,//1 minute
    //             data: {
    //                 _csrf_token: $("#csrf").val(),
    //                 tpin: tpin
    //             },
    //             success: function(result) {
    //                 if(result.data){
    //                     populate_taxes(result.data)
    //                 }
    //                 else{
    //                     Swal.fire(
    //                         'Oops..',
    //                         result.error,
    //                         'error'
    //                     )
    //                     tbl_client_taxes.processing(false);
    //                 }
    //             },
    //             error: function(request, msg, error) {
    //                 $('.error').text(msg);
    //                 tbl_client_taxes.processing(false);
    //             }
    //         });

    //     }
    //     else{
    //         tbl_client_taxes.processing(false);
    //         Swal.fire(
    //             'Oops..',
    //             "Kindly Enter TPIN",
    //             'error'
    //         ) 
    //     }
    // });


    // $('#tbl_domt_client_tax_types').on('click', 'td.btn_tax_liabilities', function () {
	// 	var tr = $(this).closest('tr');
	// 	var row = tbl_client_taxes.row(tr);
    //     var data = row.data();
    //     tax_liabilities(data.liability_types);  
	// });

    // function tax_liabilities(data){
    //     $('#tbl_tax_liabilities').DataTable( {
    //         paging: false,
    //         info: false,
    //         dom: "lfrti",
    //         bFilter: false,
    //         data: data,
    //         columns: [
    //         {"data": "liability_type_code"},
    //         {"data": "liability_type_name"},
    //         ]
    //     });
    //     $('#tax_liabilities_modal').modal('show');
    // }

    // //-------------- Destroy datatable when modal closed----------
    // $('#tax_liabilities_modal').on('hidden.bs.modal', function (event){
    //     $('#tbl_tax_liabilities').DataTable().clear().destroy();
    // });

    // tbl_client_taxes.on('select', function (e, dt, type, indexes) {
    //     document.getElementById("btn_fetch_tax_accounts").style.display = "block";
    // });

    // tbl_client_taxes.on('deselect', function (e, dt, type, cell, originalEvent) {
    //     document.getElementById("btn_fetch_tax_accounts").style.display = "none";
    // });

    // $('#btn_fetch_tax_accounts').on( 'click', function () {
    //     var me = tbl_client_taxes.row({selected: true}).data(); 

    //     $.ajax({
    //         type: "POST",
    //         url: "/zra/client/tax/accounts/fetch",
    //         dataType: "json",
    //         timeout: 60000,//1 minute
    //         data: {
    //             _csrf_token: $("#csrf").val(),
    //             tax_code: me.tax_type_code
    //         },
    //         success: function(result) {
    //             if(result.data){
    //                 console.log(result.data)
    //                 populate_tax_accounts(result.data)
    //                 document.getElementById("init_screen").style.display = "none";
    //                 document.getElementById("new_screen").style.display = "block";
    //             }
    //             else{
    //                 Swal.fire(
    //                     'Oops..',
    //                     result.error,
    //                     'error'
    //                 )
    //             }
    //         },
    //         error: function(request, msg, error) {
    //             Swal.fire(
    //                 'Oops..',
    //                  msg,
    //                 'error'
    //             )
    //         }
    //     });
    // });


    // //==========================TTTTTTTTTTTTTTTTTTTTTTTT======================
    // //================================ GENERATE PRN =============================
    // var tbl_client_tax_accs = $('#tbl_domt_client_tax_accounts').DataTable({
    //     "responsive": true,
    //     "processing": true,
    //     "select": {
    //         "style": 'single'
    //     },
    //     'language': {
    //         'loadingRecords': '&nbsp;',
    //         processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
    //         "emptyTable": "No Tax Accounts"
    //     },
    //     "paging": true,
    //     "pageLength": 10,
    //     "serverSide": false,
    //     "columns": [
    //         {"data": ""},
    //         {"data": "account_id"},
    //         {"data": "account_name"},
    //         {"data": ""}
    //     ],
    //     "lengthMenu": [[10, 25], [10, 25]],
    //     "order": [[1, 'asc']],
    //     'columnDefs': [
    //         {
    //             targets: 0,
    //             defaultContent: '',
    //             orderable: false,
    //             className: 'select-checkbox',
    //             createdCell:  function (td, cellData, rowData, row, col){
    //                 $(td).addClass( 'select-enabled' );
    //             }  
    //         },
    //         {
    //             "targets": 2,
    //             "className": "text-center"
    //         },
    //         {
    //             'targets': 3,
    //             "className": "btn_acc_liabilities",
    //             "render": function (data, type, row) {
    //                 return '<button class="btn btn-xs btn-pills waves-effect waves-themed" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Liabilities</button>';
    //             }
    //         }
    //     ],
    //     responsive: true,
    //     lengthChange: false,
    //     dom:'Bfrtip'
    // });


    // function populate_tax_accounts(data) {
    //     if (data.length == 0) {
    //         tbl_client_tax_accs.context[0].oLanguage.sEmptyTable = "No Tax Accounts Found...";
    //         tbl_client_tax_accs.clear().draw();
    //     }
    //     else{
    //         tbl_client_tax_accs.processing(false);
    //         tbl_client_tax_accs.clear().draw();
    //         tbl_client_tax_accs.rows.add(data);
    //         tbl_client_tax_accs.columns.adjust().draw();
    //     }
    //     tbl_client_tax_accs.processing(false);  
    // }

    // $('#tbl_domt_client_tax_accounts').on('click', 'td.btn_acc_liabilities', function () {
	// 	var tr = $(this).closest('tr');
	// 	var row = tbl_client_tax_accs.row(tr);
    //     var data = row.data();
    //     tax_accs_liabilities(data.liabilities);  
	// });

    // function tax_accs_liabilities(data){
    //     $('#tbl_tax_accs_liabilities').DataTable( {
    //         paging: false,
    //         info: false,
    //         dom: "lfrti",
    //         bFilter: false,
    //         data: data,
    //         columns: [
    //         {"data": "liability_code"},
    //         {"data": "liability_name"},
    //         ]
    //     });
    //     $('#tax_accs_liabilities_modal').modal('show');
    // }

    // //-------------- Destroy datatable when modal closed----------
    // $('#tax_accs_liabilities_modal').on('hidden.bs.modal', function (event){
    //     $('#tbl_tax_accs_liabilities').DataTable().clear().destroy();
    // });




    function display_client_prn_details(prn){
        var modal = $('#prn_details_modal')

        modal.find('.modal-body #prn_prn').val(prn.prn);
        modal.find('.modal-body #prn_tpin').val(prn.tax_payer_tpin);
        modal.find('.modal-body #prn_agent_tpin').val(prn.agent_tpin);
        modal.find('.modal-body #prn_payer_name').val(prn.tax_payer_name);
        modal.find('.modal-body #prn_date').val(prn.prn_date);
        modal.find('.modal-body #prn_type').val(prn.prn_type);
        modal.find('.modal-body #prn_amount').val(prn.total_amount);
        modal.find('.modal-body #prn_ccy').val(prn.currency_code);
        modal.find('.modal-body #prn_narration').val(prn.narration);
        modal.find('.modal-body #prn_status').val(prn.prn_status);
        modal.find('.modal-body #prn_rcpt_no').val(prn.receipt_number);
        modal.find('.modal-body #prn_rcpt_dt').val(prn.receipt_date);
        $('#tbl_test_breakdown').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: prn.breakdown,
            columns: [
            {"data": "tax_code"},
            {"data": "amount"},
            ]
        });

        $('#prn_details_modal').modal('show');
    }


    //---------------- get prn details --------- https://api.kubetest.dotgov.md/t/govzm/EBanking/
    $('#client_test_prn_details').on( 'click', function () {
        $.blockUI();
        $.ajax({
            type: "POST",
            url: "/zra/fetch/prn/details",
            dataType: "json",
            timeout: 60000,//1 minute
            data: {
                _csrf_token: $("#csrf").val(),
                prn: $("#test_prn").val(),
            },
            success: function(result) {
                if(result.data){
                    display_client_prn_details(result.data)
                }
                else{
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
                    msg,
                    'error'
                )
            }
        });
    });

    //-------------- Destroy datatable when modal closed----------
    $('#prn_details_modal').on('hidden.bs.modal', function (event){
        $('#tbl_test_breakdown').DataTable().clear().destroy();
    });


    //================================ GENERATE PRN =============================
    var tbl_client_taxes = $('#tbl_domt_client_tax_types').DataTable({
        "responsive": true,
        "processing": true,
        "select": {
            "style": 'single'
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
            {"data": "tax_type_code"},
            {"data": "tax_type_name"},
            {"data": ""}
        ],
        "lengthMenu": [[10, 25, 50], [10, 25, 50]],
        "order": [[1, 'asc']],
        'columnDefs': [
            {
                targets: 0,
                defaultContent: '',
                orderable: false,
                className: 'select-checkbox',
                createdCell:  function (td, cellData, rowData, row, col){
                    $(td).addClass( 'select-enabled' );
                }  
            },
            {
                "targets": 2,
                "className": "text-center"
            },
            {
                'targets': 3,
                "className": "btn_tax_liabilities",
                "render": function (data, type, row) {
                    return '<button class="btn btn-secondary btn-xs" style="background-color: #8dc63f; font-weight: bold;">Liabilities</button>';
                }
            }
        ],
        lengthChange: true,
        dom:'Bfrtip'
    });


    function populate_taxes(data) {
        if (data.length == 0) {
            tbl_client_taxes.context[0].oLanguage.sEmptyTable = "No DOMT Taxes Found...";
            tbl_client_taxes.clear().draw();
        }
        else{
            tbl_client_taxes.processing(false);
            tbl_client_taxes.clear().draw();
            tbl_client_taxes.rows.add(data);
            tbl_client_taxes.columns.adjust().draw();
        }
        tbl_client_taxes.processing(false);  
    }

    //---------------- fetch taxes ---------
    var tpin = "";
    $('#fetch_client_tax_types').on( 'click', function () {
        tpin = $("#client_tpin").val();

        if(tpin){
            tbl_client_taxes.processing( true );
            $.blockUI();
            $.ajax({
                type: "POST",
                url: "/zra/client/taxes/fetch",
                dataType: "json",
                timeout: 60000,//1 minute
                data: {
                    _csrf_token: $("#csrf").val(),
                    tpin: tpin
                },
                success: function(result) {
                    if(result.data){
                        console.log(result.data)
                        populate_taxes(result.data)
                    }
                    else{
                        Swal.fire(
                            'Oops..',
                            result.error,
                            'error'
                        )
                        tbl_client_taxes.processing(false);
                    }
                },
                error: function(request, msg, error) {
                    $('.error').text(msg);
                    tbl_client_taxes.processing(false);
                }
            });

        }
        else{
            tbl_client_taxes.processing(false);
            Swal.fire(
                'Oops..',
                "Kindly Enter TPIN",
                'error'
            ) 
        }
    });


    $('#tbl_domt_client_tax_types').on('click', 'td.btn_tax_liabilities', function () {
		var tr = $(this).closest('tr');
		var row = tbl_client_taxes.row(tr);
        var data = row.data();
        tax_liabilities(data.liability_types);  
	});

    function tax_liabilities(data){
        $('#tbl_tax_liabilities').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: data,
            columns: [
            {"data": "liability_type_code"},
            {"data": "liability_type_name"},
            ]
        });
        $('#tax_liabilities_modal').modal('show');
    }

    //-------------- Destroy datatable when modal closed----------
    $('#tax_liabilities_modal').on('hidden.bs.modal', function (event){
        $('#tbl_tax_liabilities').DataTable().clear().destroy();
    });

    tbl_client_taxes.on('select', function (e, dt, type, indexes) {
        document.getElementById("btn_fetch_tax_accounts").style.display = "block";
    });

    tbl_client_taxes.on('deselect', function (e, dt, type, cell, originalEvent) {
        document.getElementById("btn_fetch_tax_accounts").style.display = "none";
    });

    $('#btn_fetch_tax_accounts').on( 'click', function () {
        var me = tbl_client_taxes.row({selected: true}).data(); 
        $.blockUI();
        $.ajax({
            type: "POST",
            url: "/zra/client/tax/accounts/fetch",
            dataType: "json",
            timeout: 60000,//1 minute
            data: {
                _csrf_token: $("#csrf").val(),
                tax_code: me.tax_type_code,
                tpin: tpin
            },
            success: function(result) {
                if(result.data){
                    console.log(result.data)
                    populate_tax_accounts(result.data)
                    document.getElementById("init_screen").style.display = "none";
                    document.getElementById("new_screen").style.display = "block";
                }
                else{
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
                     msg,
                    'error'
                )
            }
        });
    });



    

    //==========================TTTTTTTTTTTTTTTTTTTTTTTT======================
    //================================ GENERATE PRN =============================
    var tbl_client_tax_accs = $('#tbl_domt_client_tax_accounts').DataTable({
        "responsive": true,
        "processing": true,
        "select": {
            "style": 'single'
        },
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Tax Accounts"
        },
        "paging": true,
        "pageLength": 10,
        "serverSide": false,
        "columns": [
            {"data": ""},
            {"data": "account_id"},
            {"data": "account_name"},
            {"data": ""}
        ],
        "lengthMenu": [[10, 25], [10, 25]],
        "order": [[1, 'asc']],
        'columnDefs': [
            {
                targets: 0,
                defaultContent: '',
                orderable: false,
                className: 'select-checkbox',
                createdCell:  function (td, cellData, rowData, row, col){
                    $(td).addClass( 'select-enabled' );
                }  
            },
            {
                "targets": 2,
                "className": "text-center"
            },
            {
                'targets': 3,
                "className": "btn_acc_liabilities",
                "render": function (data, type, row) {
                    return '<button class="btn btn-secondary btn-xs" style="background-color: #8dc63f; font-weight: bold;">Liabilities</button>';
                }
            }
        ],
        responsive: true,
        lengthChange: false,
        dom:'Bfrtip'
    });


    function populate_tax_accounts(data) {
        if (data.length == 0) {
            tbl_client_tax_accs.context[0].oLanguage.sEmptyTable = "No Tax Accounts Found...";
            tbl_client_tax_accs.clear().draw();
        }
        else{
            tbl_client_tax_accs.processing(false);
            tbl_client_tax_accs.clear().draw();
            tbl_client_tax_accs.rows.add(data);
            tbl_client_tax_accs.columns.adjust().draw();
        }
        tbl_client_tax_accs.processing(false);  
    }


    tbl_client_tax_accs.on('select', function (e, dt, type, indexes) {
        document.getElementById("btn_fetch_acc_liab").style.display = "block";
    });

    tbl_client_tax_accs.on('deselect', function (e, dt, type, cell, originalEvent) {
        document.getElementById("btn_fetch_acc_liab").style.display = "none";
    });



    var tbl_client_liabs = $('#tbl_client_liabs').DataTable({
        "responsive": true,
        "processing": true,
        "select": {
            "style": 'multi'
        },
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> ',
            "emptyTable": "No Liabilities Found"
        },
        "paging": true,
        "pageLength": 10,
        "serverSide": false,
        "columns": [
            {"data": ""},
            {"data": "liability_code"},
            {"data": "liability_name"},
            {"data": "liability_type_code"},
            {"data": "liability_type_name"},
            {"data": "tax_account_id"},
            {"data": "amount"},
            {"data": "reference_number"},
            {"data": "period_start"},
            {"data": "period_end"}
        ],
        "lengthMenu": [[10, 25], [10, 25]],
        "order": [[1, 'asc']],
        'columnDefs': [
            {
                targets: 0,
                defaultContent: '',
                orderable: false,
                className: 'select-checkbox',
                createdCell:  function (td, cellData, rowData, row, col){
                    $(td).addClass( 'select-enabled' );
                }  
            }
        ],
        responsive: true,
        lengthChange: false,
        dom:'Bfrtip',
        buttons: [ 
            {
                 extend: 'selectAll',
                 action: function() {
                    tbl_client_liabs.rows(function ( idx, data, node ) {
                        return true;
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


    function populate_liabilities(data) {
        if (data.length == 0) {
            tbl_client_liabs.context[0].oLanguage.sEmptyTable = "No Tax Accounts Found...";
            tbl_client_liabs.clear().draw();
        }
        else{
            tbl_client_liabs.processing(false);
            tbl_client_liabs.clear().draw();
            tbl_client_liabs.rows.add(data);
            tbl_client_liabs.columns.adjust().draw();
        }
        tbl_client_liabs.processing(false);  
    }

    $('#btn_fetch_acc_liab').on( 'click', function () {
        var tax_acc_data = tbl_client_tax_accs.row({selected: true}).data(); 
        $.blockUI();
        $.ajax({
            type: "POST",
            url: "/zra/client/tax/accounts/liab",
            dataType: "json",
            timeout: 60000,//1 minute
            data: {
                _csrf_token: $("#csrf").val(),
                acc_id: tax_acc_data.account_id,
                tpin: tpin
            },
            success: function(result) {
                if(result.data){
                    console.log(result.data)
                    populate_liabilities(result.data)
                    // document.getElementById("init_screen").style.display = "none";
                    document.getElementById("new_screen").style.display = "none";
                    document.getElementById("last_screen").style.display = "block";
                }
                else{
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
                     msg,
                    'error'
                )
            }
        });
    });


    function get_selected_liabs(){
        var liabs =[];
        var sum = 0;

        tbl_client_liabs.rows( { selected: true } ).every(function(rowIdx) {
            var liab = {
                tax_acc_id: tbl_client_liabs.row(rowIdx).data().tax_account_id,
                amount: tbl_client_liabs.row(rowIdx).data().amount,
                from: tbl_client_liabs.row(rowIdx).data().period_start,
                to: tbl_client_liabs.row(rowIdx).data().period_end,
                ref: tbl_client_liabs.row(rowIdx).data().reference_number,
                liab_code: tbl_client_liabs.row(rowIdx).data().liability_code,
                liab_type_code: tbl_client_liabs.row(rowIdx).data().liability_type_code,
            }
            sum = sum+parseFloat(liab.amount)
            liabs.push(liab)
        })
        return {liabs: liabs, count: liabs.length, amount: sum}
    }



    tbl_client_liabs.on('select', function (e, dt, type, indexes) {
        var selected_sum = get_selected_liabs().amount
        document.getElementById("btn_gen_prn").style.display = "block";
        // $('#total_liab_amount').text(selected_sum);
    });

    tbl_client_liabs.on('deselect', function (e, dt, type, cell, originalEvent) {
        var selected_sum = get_selected_liabs().amount
        // $('#total_liab_amount').text(selected_sum);
    });



    function display_gen_results(prn){
        $('#g_prn_prn').val(prn.prn);
        $('#g_prn_tpin').val(prn.tax_payer_tpin);
        $('#g_prn_agent_tpin').val(prn.agent_tpin);
        $('#g_prn_payer_name').val(prn.tax_payer_name);
        $('#g_prn_date').val(prn.prn_date);
        $('#g_prn_type').val(prn.prn_type);
        $('#g_prn_amount').val(prn.total_amount);
        $('#g_prn_ccy').val(prn.currency_code);
        $('#g_prn_narration').val(prn.narration);
        $('#g_prn_status').val(prn.prn_status);
        $('#g_prn_rcpt_no').val(prn.reciept_number);
        $('#g_prn_rcpt_dt').val(prn.receipt_date);
    }


    $('#btn_gen_prn').on( 'click', function (event) {

        Swal.fire({
            title: 'Are you sure you want to Generate PRN?',
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
                    url: "/zra/client/gen/prn",
                    type: 'POST',
                    data: {
                        tpin: tpin, 
                        liabilities: get_selected_liabs().liabs, 
                        _csrf_token: $('#csrf').val()
                    },
                    success: function(result) {
                        if (result.data){
                            if (result.data){
                                console.log(result.data)
                                display_gen_results(result.data)
                                document.getElementById("last_screen").style.display = "none";
                                document.getElementById("prn_details_screen").style.display = "block"; 
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
                    'Operation not performed :)',
                    'error'
                )
            }
        })
    });













    $('#tbl_domt_client_tax_accounts').on('click', 'td.btn_acc_liabilities', function () {
		var tr = $(this).closest('tr');
		var row = tbl_client_tax_accs.row(tr);
        var data = row.data();
        tax_accs_liabilities(data.liabilities);  
	});

    function tax_accs_liabilities(data){
        $('#tbl_tax_accs_liabilities').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: data,
            columns: [
            {"data": "liability_code"},
            {"data": "liability_name"},
            ]
        });
        $('#tax_accs_liabilities_modal').modal('show');
    }

    //-------------- Destroy datatable when modal closed----------
    $('#tax_accs_liabilities_modal').on('hidden.bs.modal', function (event){
        $('#tbl_tax_accs_liabilities').DataTable().clear().destroy();
    });






    function display_prn_details(prn){
        var modal = $('#prn_details_modal')

        modal.find('.modal-body #prn_prn').val(prn.prn);
        modal.find('.modal-body #prn_tpin').val(prn.tax_payer_tpin);
        modal.find('.modal-body #prn_agent_tpin').val(prn.agent_tpin);
        modal.find('.modal-body #prn_payer_name').val(prn.tax_payer_name);
        modal.find('.modal-body #prn_date').val(prn.prn_date);
        modal.find('.modal-body #prn_type').val(prn.prn_type);
        modal.find('.modal-body #prn_amount').val(prn.total_amount);
        modal.find('.modal-body #prn_ccy').val(prn.currency_code);
        modal.find('.modal-body #prn_narration').val(prn.narration);
        modal.find('.modal-body #prn_status').val(prn.prn_status);
        modal.find('.modal-body #prn_rcpt_no').val(prn.reciept_number);
        modal.find('.modal-body #prn_rcpt_dt').val(prn.receipt_date);
        $('#tbl_test_breakdown').DataTable( {
            paging: false,
            info: false,
            dom: "lfrti",
            bFilter: false,
            data: prn.breakdown,
            columns: [
            {"data": "tax_code"},
            {"data": "amount"},
            ]
        });

        $('#prn_details_modal').modal('show');
    }

    //---------------- get prn details --------- 
    $('#get_prn_details').on( 'click', function () {
        $.blockUI();
        $.ajax({
            type: "POST",
            url: "/zra/admin/prn/details",
            dataType: "json",
            timeout: 60000,//1 minute
            data: {
                _csrf_token: $("#csrf").val(),
                prn: $("#client_prn").val(),
            },
            success: function(result) {
                if(result.data){
                    display_prn_details(result.data)
                }
                else{
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
                    msg,
                    'error'
                )
            }
        });
    });

    //-------------- Destroy datatable when modal closed----------
    $('#prn_details_modal').on('hidden.bs.modal', function (event){
        $('#tbl_test_breakdown').DataTable().clear().destroy();
    });



});