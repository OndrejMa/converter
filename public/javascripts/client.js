window.addEventListener('load', () => {
    const el = $('#app');

    // Compile Handlebar Templates
    const errorTemplate = Handlebars.compile($('#error-template').html());
    const exchangeTemplate = Handlebars.compile($('#exchange-template').html());

// Router Declaration
    const router = new Router({
        mode: 'history',
        page404: (path) => {
            const html = errorTemplate({
                color: 'yellow',
                title: 'Oooops! :(',
                message: `Please use http://localhost:3000/exchange. Thank you`,
            });
            el.html(html);
        },
    });

// Instantiate api handler
    const api = axios.create({
        baseURL: 'http://localhost:3000/api',
        timeout: 5000,
    });

// Display Error Banner
    const showError = (error) => {
        const { title, message } = error.response.data;
        const html = errorTemplate({ color: 'red', title, message });
        el.html(html);
    };

    // Perform POST request, calculate and display conversion results
    const getConversionResults = async () => {
        // Extract form data
        const from = $('#from').val();
        const to = $('#to').val();                                        // currency and amount input from user
        const amount = $('#amount').val();

        try {
            const response = await api.post('/convert', {amount,from,to,});             // wait for response from server
            const {val} = response.data;                                             // Send post data to Express(proxy) server
            $('#result').html(`${to} ${val}`);
            console.log("response:", response);
        } catch (error) {
            showError(error);
        } finally {
            $('#result-segment').removeClass('loading');
        }
    };

// Handle Convert Button Click Event
    const convertRatesHandler = () => {
        if ($('.ui.form').form('is valid')) {
            // hide error message
            $('.ui.error.message').hide();
            // Post to Express server
            $('#result-segment').addClass('loading');
            getConversionResults();
            // Prevent page from submitting to server
            return false;
        }
        return true;
    };

    router.add('/exchange', async () => {
        // Display loader first
        let html = exchangeTemplate(exchangeTemplate);
        el.html(html);
        try {
            // Load Symbols
            const response = await api.get('/symbols');
            const { symbols } = response.data;
            html = exchangeTemplate({ symbols });
            el.html(html);
            $('.loading').removeClass('loading');
            // Validate Form Inputs
         $('.ui.form').form({
           fields: {
                 from: 'empty',
                 to: 'empty',
                 amount: 'decimal',
                },
        });
            // Specify Submit Handler
            $('.submit').click(convertRatesHandler);
        } catch (error) {
            showError(error);
        }
    });


// Navigate app to current url
    router.navigateTo(window.location.pathname);

    // Highlight Active Menu on Refresh/Page Reload
    const link = $(`a[href$='${window.location.pathname}']`);
    link.addClass('active');

    $('a').on('click', (event) => {
        // Block browser page load
        event.preventDefault();

        // Highlight Active Menu on Click
        const target = $(event.target);
        $('.item').removeClass('active');
        target.addClass('active');

        // Navigate to clicked url
        const href = target.attr('href');
        const path = href.substr(href.lastIndexOf('/'));
        router.navigateTo(path);
    });

});

