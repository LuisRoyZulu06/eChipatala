


// ----------------------------------------- Sweet Alert
$(document).ajaxStop($.unblockUI);
$(document).ready(function() {
    jQuery.fn.dataTable.Api.register( 'processing()', function ( show ) {
        return this.iterator( 'table', function ( ctx ) {
            ctx.oApi._fnProcessingDisplay( ctx, show );
        } );
    } );


    function button_options(data, row){
        var init_btn ='<button class="btn btn-secondary btn-xs" data-toggle="dropdown" style="margin-top:0px !important; padding-top: 0px !important;">Options</button>'+
        '<div class="dropdown-menu dropdown-menu-animated dropdown-menu-right position-absolute pos-top">';
        var rcpt_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success reciept">Reciept</a>';
        var trail_btn = '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success approval_tray">Approval Trail</a></div>';
        var notif_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success domt_reset_notif">Retry Notification</a>';
        var pay_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-success domt_reset_payment">Retry payment</a>';
        var confirm_pay_btn = '<a href="#" data-id="'+data+'" class="dropdown-item text-info domt_confirm_payment">Confirm As Processed</a>';
        var kyc_btn = '<a href="#" data-ref_id="'+row.ref_id+'" class="dropdown-item text-success view_kyc">View KYC</a></div>';
        var drop_btn = '<a href="#" data-id="'+ row.id+'" class="dropdown-item text-danger drop_payment" data-toggle="modal" data-target="#drop_domt_modal">Drop Entry</a>';
        var status = row.status
        var mode = row.txn_mode 

        if(status == "SUCCESS"){
            return (mode == "PORTAL" || mode == "")? init_btn+rcpt_btn+trail_btn : init_btn+rcpt_btn+kyc_btn;
        }else if(status == "PENDING_APPROVAL"){
            return init_btn+drop_btn+trail_btn;
        }else if((status == "PENDING_BANK_PAYMENT") || (status == "PENDING_NOTIFICATION")){
            return (mode == "PORTAL")? init_btn+drop_btn+trail_btn : init_btn+drop_btn+kyc_btn;
        }else if(status == "FAILED_NOTIFICATION"){
            return (mode == "PORTAL")? init_btn+notif_btn+drop_btn+trail_btn : init_btn+notif_btn+drop_btn+kyc_btn;
        }else if(status == "FAILED_PAYMENT"){
            return (mode == "PORTAL")? init_btn+pay_btn+confirm_pay_btn+drop_btn+trail_btn : init_btn+pay_btn+confirm_pay_btn+drop_btn+kyc_btn;
        }else if(status == "DROPPED"){
            return init_btn+trail_btn;
        }else{
            return '<span class="text-danger">No Actions</span>'; 
        }
    }

    function formatSearchDetails ( d ) {
        console.dir(d);

        return '<table cellpadding="5" cellspacing="0" border="0" style="padding-left:50px;">'+
            '<tr>'+
                '<td>TPIN: '+format_value(d.tpin)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>PRN Date: '+format_value(d.prn_date)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>PRN Expiry Date: '+format_value(d.prn_exp_date)+'</td>'+
            '</tr>'+
            '</tr>'+
                '<td>Payment Status: '+format_value(d.payment_error_descript)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Date initiated: '+format_value(d.initiator_date)+'</td>'+
            '</tr>'+          
            '<tr>'+
                '<td>Debit account: '+format_value(d.dr_acc)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Credit account: '+format_value(d.cr_acc)+'</td>'+
            '</tr>'+         
            '<tr>'+
                '<td>Bank ref: '+format_value(d.cbs_ref)+'</td>'+
            '</tr>'+
            '<tr>'+
                '<td>Notification Response: '+format_value(d.payment_notify_status)+'</td>'+
            '</tr>'+
        '</table>';
    }



   
    var tbl_domt_admin_report = $('#domt_admin').DataTable({
        // searching: true,
        "serverSide": true,
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
            "url"    : '/domt/admin/reports',
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
            {"data": "txn_mode"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartStatus(data)
                }
            },
            {
                "data": "id",
                "render": function (data, type, row) {
                    return button_options(data, row) 
                }
            } 
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[7, 'asc']],
            responsive: true,
            lengthChange: false,
            dom:
                "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" 
        });

    $('#btn_domt_admin_filter').on( 'click', function () {
        tbl_domt_admin_report.on('preXhr.dt', function ( e, settings, data ) {
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
        tbl_domt_admin_report.draw();
    });

    $('#domt_admin').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_domt_admin_report.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });

    $('#reload_table').on( 'click', function () {
		tbl_domt_admin_report.ajax.reload();
    });

    $('#domt_admin_excel').on( 'click', function (event) {
        $('#domtSearchForm').attr('action', '/domt/admin/export/excel');
        $('#domtSearchForm').attr('method', 'GET');
        $("#domtSearchForm").submit();
    });



    //------------------RECIEPT--------------------------
    $('#domt_admin').on('click', '.reciept', function() {
        var btn = $(this);
        var id = btn.attr("data-id")
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

    //------------------ KYC --------------------------
    $('#domt_admin').on('click', '.view_kyc', function() {
        var btn = $(this);
        var ref_id = btn.attr("data-ref_id")
            $.blockUI();
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

    $('#domt_admin').on('click', '.drop_payment', function() {
        var btn = $(this);
        var id = btn.attr("data-id");
        var modal = $('#drop_domt_modal');
        modal.find('.modal-body #drop_payment_id').val(id);
    });

    //------------------ DROP PAYMENT --------------------------
    $('#drop_domt_btn').on('click', function() {
        var decline_note = $('#drop_note').val();
        var id = $('#drop_payment_id').val();

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
                            id: id,
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

    $('#domt_admin').on('click', '.approval_tray', function() {
        var btn = $(this);
        var ref_id = btn.attr("data-ref_id");
            $.blockUI();
            $.ajax({
                url: "/report/approval/trial",
                type: 'POST',
                data: {
                    ref_id: ref_id, 
                    _csrf_token: $('#csrf').val()
                },
                success: function(result) {
                    if (result.data){
                        approval_trial_modal(result.data)
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
        modal.find('.modal-body #address').text(prn.amount);
        modal.find('.modal-body #bank_ref').text(prn.cbs_ref);
        modal.find('.modal-body #mid').text(prn.merchant_id);
        modal.find('.modal-body #prn_amount').text(txn_amount);
        modal.find('.modal-body #amount_words').text(prn.amount_words);
        
        $('#domt_reciept').modal('show');
    }

    function kyc_modal(kyc){
        var modal = $('#kyc_modal')
        modal.find('.modal-body #company').val(kyc.company);
        modal.find('.modal-body #address').val(kyc.payer_address);
        modal.find('.modal-body #email').val(kyc.payer_email);
        modal.find('.modal-body #mobile').val(kyc.payer_mobile);
        modal.find('.modal-body #name').val(kyc.payer_name);
        modal.find('.modal-body #nrc').val(kyc.payer_nrc);
        $('#kyc_modal').modal('show');
    }


    //------------RESET NOTIFICATION TRY---------
    $('#domt_admin tbody').on( 'click', '.domt_reset_notif', function (event) {
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
                $.blockUI();
                $.ajax({
                    url: "/domt/admin/reset/notif",
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

    //------------RESET NOTIFICATION TRIES---------
    $('#domt_admin tbody').on( 'click', '.domt_reset_payment', function (event) {
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
                $.blockUI();
                $.ajax({
                    url: "/domt/admin/reset/bankpayment",
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




    //=========================Proceed Payment For Pending Settlement/ Update========================
   $('#domt_admin tbody').on('click', '.domt_confirm_payment', function (e) {
        e.preventDefault();
        let btn = $(this);
        let form = document.getElementById('confirm_payment_form');
        form.innerHTML = `
            <div class="form-group">
                <label class="form-label">Please Enter the Bank Reference Below...</label>
                <div class="input-group">
                    <div class="input-group-prepend">
                        <span class="input-group-text"><i class="fal fa-pen"></i></span>
                    </div>
                    <input type="hidden" name="_csrf_token" value="${$('#csrf').val()}">
                    <input type="hidden" name="id" id="id" value="${btn.attr("data-id")}">
                    <input type="text" name="reference" id="reference" class="form-control" placeholder="Bank Reference" required="">
                </div>
            </div>

            <div class="modal-footer">
                <button type="button" class="btn btn-secondary btn-pills waves-effect waves-themed text-whit" data-dismiss="modal">Close</button>
                <button type="submit" class="btn btn-pills waves-effect waves-themed text-white" style="background-color: #2196F3;;">SUBMIT</button>
            </div>
        `;
        $('#confirm_payment').modal('show');
    });


    $('#confirm_payment_form').submit(function(e) {
        e.preventDefault();
        let data = $(this).serialize();
        $('#confirm_payment').modal('hide');
        Swal.fire({
            title: 'Confirm That Client Has Been Debited?',
            text: "CAUTION: This applies to transactions where a client has been debited but the transaction remains in FAILED BANK PAYMENT!",
            type: "warning",
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Yes, Update Entry!'
        }).then((result) => {
            if (result.value) {
                $.blockUI();
                $.ajax({
                    type: 'POST',
                    url: '/domt/admin/confirm/bankpayment',
                    data: data,
                    success: function (result) {
                        if (result.data) {
                            Swal.fire(
                                'Success',
                                'Payment confirmed successfully!',
                                'success'
                            )
                            location.reload();
                        } else {
                            Swal.fire(
                                'Error!',
                                response.message,
                                'error'
                            )
                            location.reload();
                        }
                    }
                });
            } else {
                Swal.fire(
                    'Cancelled!',
                    'Payment confirmation cancelled.',
                    'error'
                )
            }
        });
    });

    //-------------------- Exceptions -------------------
    var tbl_domt_exceptions = $('#domt_exceptions').DataTable({
        // searching: true,
        "serverSide": true,
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
            "url"    : '/domt/admin/exceptions',
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
            {"data": "txn_mode"},
            {
                "data": "status",
                "render": function (data, type, row) {
                    return formartStatus(data)
                }
            },
            {
                "data": "id",
                "render": function (data, type, row) {
                    return button_options(data, row) 
                }
            } 
        ],
        "lengthMenu": [[10, 25, 50, 100, 500, 1000], [10, 25, 50, 100, 500, 1000]],
        "order": [[7, 'asc']],
            responsive: true,
            lengthChange: false,
            dom:
                "<'row mb-3'<'col-sm-12 col-md-6 d-flex align-items-center justify-content-start'f><'col-sm-12 col-md-6 d-flex align-items-center justify-content-end'lB>>" +
                "<'row'<'col-sm-12'tr>>" +
                "<'row'<'col-sm-12 col-md-5'i><'col-sm-12 col-md-7'p>>" 
        });
        
    $('#reload_table').on( 'click', function () {
		tbl_domt_exceptions.ajax.reload();
    });    

    $('#btn_domt_exceptions_filter').on( 'click', function () {
        tbl_domt_exceptions.on('preXhr.dt', function ( e, settings, data ) {
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
        tbl_domt_exceptions.draw();
    });    

    $('#domt_exceptions').on('click', 'td.details-control', function () {
        var tr = $(this).closest('tr');
        var row = tbl_domt_exceptions.row(tr);

        if (row.child.isShown()) {
            row.child.hide();
            tr.removeClass('shown');
        }
        else {
            row.child(formatSearchDetails(row.data())).show();
            tr.addClass('shown');
        }
    });

    //-----------------------------------------------------------
    //--------------------- APPROVAL TRAIL ----------------------
    $('#domt_exceptions').on('click', '.approval_tray', function() {
        var btn = $(this);
        var ref_id = btn.attr("data-ref_id");
            $.blockUI();
            $.ajax({
                url: "/report/approval/trial",
                type: 'POST',
                data: {
                    ref_id: ref_id, 
                    _csrf_token: $('#csrf').val()
                },
                success: function(result) {
                    if (result.data){
                        approval_trial_modal(result.data)
                    } else {
                        Swal.fire(
                            'Error!',
                            result.error,
                            'error'
                        )
                    }
                },
                error: function(request, msg, error) {
                    Swal.fire(
                        'Error!',
                        'Something went wrong! Please try again',
                        'error'
                    )
                }
            });
    
    });

    $('#domt_exceptions').on('click', '.drop_payment', function() {
        var btn = $(this);
        var id = btn.attr("data-id");
        var modal = $('#drop_domt_modal');
        modal.find('.modal-body #drop_payment_id').val(id);
    });

});



