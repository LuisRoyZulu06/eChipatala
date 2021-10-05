$(document).ready(function() {

    var sms_logs = $('#sms_logs_table').DataTable({
        "serverSide": true,
        "responsive": true,
        "processing": true,
        'language': {
            'loadingRecords': '&nbsp;',
            processing: '<i class="fal fa-spinner fa-spin fa-2x fa-fw"></i><span class="sr-only">Loading...</span> '
        },
        'ajax': {
            "type": "POST",
            "url": '/Sms/Logs',
            "data": {
                "_csrf_token": $("#csrf").val(),
                "mobile": $('#mobile').val(),
                "status": $('#status').val(),
                "from": $('#from').val(),
                "to": $('#to').val()
            }    
        },
        "paging": true,
        "pageLength": 10,
        "columns": [
            { "data": "date_sent" },
            { "data": "mobile" },
            { "data": "status" },
            { "data": "msg" }
        ],
        "lengthMenu": [[10, 25, 50, 100], [10, 25, 50, 100]],
        "order": [[1, 'asc']]
    });

    $('#btn_sms_filter').on( 'click', function () {
        sms_logs.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.mobile = $('#mobile').val();
            data.status = $('#status').val();
            data.from = $('#from').val();
            data.to = $('#to').val();  
        } );
        $('#filter_sms').modal('hide');
        sms_logs.draw();
    });


     //**************************************************email logas */

     var email_logs_dt = $('#tbl_email_logs').DataTable({
        "select": {
            "style": 'multi'
        },
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
            "url"    : '/email/logs',
            "data"   : {
                "_csrf_token": $("#csrf").val(),
                "email": $('#email').val(),
                "status": $('#status').val(),
                "to": $('#to').val(),
                "from": $('#from').val()
            }
        },
        "columns": [
            {"data": "recipient_email"},
            {"data": "subject"},
            {"data": "mail_body"},
            {"data": "status"},
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


    $('#btn_email_filter').on( 'click', function () {
        email_logs_dt.on('preXhr.dt', function ( e, settings, data ) {
            data._csrf_token = $("#csrf").val();
            data.email = $('#email').val();
            data.from = $('#from').val();
            data.to = $('#to').val();
            data.status = $('#status').val();
        } );

        $('#filter_mail').modal('hide');
        email_logs_dt.draw();
    });



});
