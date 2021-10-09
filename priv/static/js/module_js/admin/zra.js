$(document).ready(function() {
    $(document).ajaxStop($.unblockUI);

    jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
        return this.iterator( 'table', function ( ctx ) {
            ctx.oApi._fnProcessingDisplay( ctx, show );
        } );
    } );

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
        }else if(status == "FAILED_PAYMENT"){
            stat = "<span class='text-danger'>FAILED BANK PAYMENT</span>";
        }else if(status == "FAILED_NOTIFICATION"){
            stat = "<span class='text-danger'>FAILED NOTIFICATION</span>";
        }else if((status == "DROPPED") || (status == "DECLINED")){
            stat = "<span class='text-danger'>"+status+"</span>";
        }else if(status == "PENDING_APPROVAL"){
            stat = "<span class='text-primary'>PENDING APPROVAL</span>";
        }else{
            stat = status
        }
        return stat;
    }


    function admin_button_options(data, row){
        var init_btn ='<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="background-color: #FFD5AD; color: #C02629; font-weight: bold;">Options</button>'+
        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">';
        var dtls_btn = '<a href="/zra/admin/prn/details?id='+ data +'" class="dropdown-item text-success">Details</a>';
        var rcpt_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a></div>';
        // var rcpt_btn = '<a href="/zra/prn/reciept?id='+data+'" data-id="'+data+'" class="dropdown-item text-success">Reciept</a></div>';
        var trail_btn = '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success approval_tray">Approval Trail</a>';
        var pay_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-primary zra_reset_payment">Retry payment</a>';
        var conf_proc_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-info zra_confirm_payment">Confirm As Processed</a>';
        var notif_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-primary zra_reset_notif">Retry Notification</a>';
        var drop_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-danger zra_drop_payment">Drop payment</a></div>';

        var status = row.status

        if(status == "SUCCESS"){
            return init_btn+dtls_btn+trail_btn+rcpt_btn;
        }else if(status == "PENDING_APPROVAL"){
            return init_btn+trail_btn+dtls_btn+'</div>';
        }else if((status == "PENDING_BANK_PAYMENT") || (status == "PENDING_NOTIFICATION")){
            return init_btn+trail_btn+dtls_btn+'</div>';
        }else if(status == "FAILED_NOTIFICATION"){
            return init_btn+dtls_btn+notif_btn+trail_btn+drop_btn;
        }else if(status == "FAILED_PAYMENT"){
            return init_btn+dtls_btn+pay_btn+conf_proc_btn+trail_btn+drop_btn;
        }else{
            return '<span class="text-danger">No Actions</span>'; 
        }
    }
    
    var tbl_admin_zra = $('#tbl_zra_admin').DataTable({
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
            "url"    : '/zra/admin/reports',
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
            {"data": "txn_mode"},
            {"data": "tax_payer_tpin"},
            {"data": "company_name"},
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
                    return admin_button_options(data, row)
                }
            } 
        ],
        "columnDefs": [
			{
				targets: [6],
				render: $.fn.dataTable.render.ellipsis( 10, true, true)
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


    $('#tbl_zra_admin').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_admin_zra.row(tr);

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
    $('#btn_zra_admin_filter').on( 'click', function () {
        tbl_admin_zra.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.payer_tpin = $('#filter_tpin').val();
            data.prn = $('#filter_prn').val();
            data.type = $('#filter_prn_type').val();
            data.status = $('#filter_status').val();
            data.from = $('#filter_from').val();
            data.to = $('#filter_to').val();  
        } );
        $('#filter').modal('hide');
        tbl_admin_zra.draw();
    });

    $('#reload_table').on( 'click', function () {
        tbl_admin_zra.ajax.reload();
    });

    $('#admin_export_excel').on( 'click', function (event) {
        $('#reportSearchForm').attr('action', '/zra/admin/excel');
        $('#reportSearchForm').attr('method', 'GET');
        $("#reportSearchForm").submit();
    });

    $('#tbl_zra_admin').on('click', '.prn_breakdown', function () {
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

    function reciept_modal(result){
        var prn = result.data
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

    function formatSearchDetails ( a ) {
        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>Tax Payer Name: '+format_value(a.tax_payer_name)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Agent TPIN: '+format_value(a.agent_tpin)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date initiated: '+format_value(a.initiator_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date Approved: '+format_value(a.approver_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Transaction Charge: '+format_value(a.charge_amount)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Debit Account: '+format_value(a.dr_acc)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Bank Reference: '+format_value(a.cbs_ref)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Bank Status Description: '+format_value(a.cbs_resp)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>ZRA Status Description: '+format_value(a.zra_notif_resp)+'</td>'+
            '</tr>'+
        '</table>';
    }

    //------------------RECIEPT-------------------------
    $('#tbl_zra_admin').on('click', '.reciept', function() {
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

    //------------RESET PAYMENT TRY---------
    $('#tbl_zra_admin tbody').on( 'click', '.zra_reset_payment', function (event) {
        Swal.fire({
            title: 'Are you sure you want to retry Bank payment?',
            text: "proceed With Payment",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {

                $.ajax({
                    url: "/zra/admin/reset/payment",
                    type: 'POST',
                    data: {
                        id: $(event.target).attr("data-id"), 
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

    //------------ CONFIRM PAYMENT ------------zra_confirm_payment
    $('#tbl_zra_admin tbody').on( 'click', '.zra_confirm_payment', function (event) {
        var id = $(this).attr("data-id")
        var modal = $('#mark_complete_modal')
        modal.find('.modal-body #id').val(id);
        modal.modal('show');
    });

    $('#confirm_payment_form').on('submit', function(e) {
        $('#mark_complete_modal').modal('hide');
        e.preventDefault();
        var data = getFormData($(this));
        Swal.fire({
            title: 'Confirm That Client Was Debited?',
            text: "CAUTION: This Applies When Client Has Been Debited But System Shows Otherwise",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/zra/admin/confirm/payment",
                    type: 'POST',
                    data: {
                        id: data.id,
                        cbs_ref: data.cbs_ref,  
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
        


    //------------RESET NOTIFICATION TRY---------
    $('#tbl_zra_admin tbody').on( 'click', '.zra_reset_notif', function (event) {
        Swal.fire({
            title: 'Are you sure you want to try ZRA Notification?',
            text: "proceed To Try Notification",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, continue!',
            showLoaderOnConfirm: true
            }).then((result) => {
            if (result.value) {
                $.ajax({
                    url: "/zra/admin/reset/notif",
                    type: 'POST',
                    data: {
                        id: $(event.target).attr("data-id"), 
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


    $('#tbl_zra_admin tbody').on('click', '.approval_tray', function () {
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




    //------------DROP ZRA TRANSACTION---------
    //============================DROP PAYMENT TRY===================================
    $('#tbl_zra_admin tbody').on( 'click', '.zra_drop_payment', function (e) {
        e.preventDefault();
        let btn = $(this);
        console.log(btn);
        let form = document.getElementById('drop_zra_payment_form');
        form.innerHTML = `
            <div class="form-group">
                <label class="form-label">Please state the reason for dropping the transaction...</label>
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fal fa-comment"></i></span>
                    </div>
                    <input type="hidden" name="_csrf_token" value="${$('#csrf').val()}">
                    <input type="hidden" name="id" id="id" value="${btn.attr("data-id")}">
                    <input type="text" name="reviewer_remarks" id="reviewer_remarks" class="form-control" placeholder="Revier Remarks" required="">
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-pills waves-effect waves-themed text-whit" data-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-pills waves-effect waves-themed text-white" style="background-color: #2196F3;;">SUBMIT</button>
            </div>
        `;
        $('#drop_payments').modal('show');
    });


    $('#drop_zra_payment_form').submit(function(e) {
        e.preventDefault();
        let data = $(this).serialize();
        $('#drop_payments').modal('hide');
        Swal.fire({
            title: 'Are you sure?',
            text: 'You will drop this payment',
            type: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Drop Payment!'
        }).then((result) => {
            if (result.value) {
                $.ajax({
                    type: 'POST',
                    url: '/zra/drop/payment',
                    data: data,
                    success: function (result) {
                        if (result.data) {
                            Swal.fire(
                                'Success',
                                'Transaction Successfully Dropped!',
                                'success'
                            )
                            location.reload(true);
                        } else {
                            Swal.fire(
                                'Failed!',
                                response.message,
                                'error'
                            )
                            location.reload(true);
                        }
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled!',
                    'Operation cancelled :)',
                    'error'
                )
            }
        });
    });


    // $('#tbl_zra_admin tbody').on( 'click', '.zra_drop_payment', function (event) {
        
    // });


    var tbl_prn = $('#tbl_admin_test_prn').DataTable({
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
            {"data": "prn"},
            {"data": "prn_type"},
            {"data": "currency_code"},
            {"data": "tax_payer_tpin"},
            {"data": "agent_tpin"},
            {"data": "tax_payer_name"},
            {"data": "total_amount"},
            {"data": "prn_date"},
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[1, 'asc']],
        responsive: true,
        lengthChange: false,
        dom:'Bfrtip',
    });


    function populate_prns(data) {
        if (data.length == 0) {
            tbl_prn.context[0].oLanguage.sEmptyTable = "No PRN's Found...";
            tbl_prn.clear().draw();
            tbl_prn.rows.add(data);
            tbl_prn.columns.adjust().draw();
        }
        else{
            tbl_prn.processing(false);
            tbl_prn.clear().draw();
            tbl_prn.rows.add(data);
            tbl_prn.columns.adjust().draw();
        }
        tbl_prn.processing(false);  
    }

    //---------------- fetch prns ---------
    $('#fetch_admin_prn').on( 'click', function () {
        tbl_prn.processing( true );
        $.ajax({
            type: "POST",
            url: "/zra/admin/prns/fetch",
            dataType: "json",
            timeout: 60000,//1 minute
            data: {
                _csrf_token: $("#csrf").val(),
                tpin: $("#tpin").val(),
                agent_type: $("#agent_type").val(),
                // currency: $("#currency").val(),
                currency: "ZMW",//$("#currency").val(),
                // prn_type: "ALL",
                prn_type: $("#prn_type").val(),
                from: $("#from").val(),
                to: $("#to").val()
                
                // from: "",
                // to: ""
            },
            success: function(result) {
                if(result.data){
                    populate_prns(result.data)
                }
                else{
                    Swal.fire(
                        'Oops..',
                        result.error,
                        'error'
                    )
                    tbl_prn.processing(false);
                }
            },
            error: function(request, msg, error) {
                Swal.fire(
                    'Oops..',
                    msg,
                    'error'
                )
                tbl_prn.processing(false);
            }
        });
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
    $('#test_prn_details').on( 'click', function () {
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