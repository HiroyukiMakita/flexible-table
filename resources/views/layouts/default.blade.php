<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">

    <title>@yield('title','Laravel')</title>

    <!-- Fonts -->
    <link href="https://fonts.googleapis.com/css?family=Nunito:200,600" rel="stylesheet">

    <!-- CSS only -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/css/bootstrap.min.css" rel="stylesheet"
          integrity="sha384-EVSTQN3/azprG1Anm3QDgpJLIm9Nao0Yz1ztcQTwFspd3yD65VohhpuuCOmLASjC" crossorigin="anonymous">

    <!-- Vuetify -->
    <link href="https://fonts.googleapis.com/css?family=Roboto:100,300,400,500,700,900" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/@mdi/font@6.x/css/materialdesignicons.min.css" rel="stylesheet">
    <link href="https://cdn.jsdelivr.net/npm/vuetify@2.x/dist/vuetify.min.css" rel="stylesheet">

    <!-- Font Awesome -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.1.0/css/all.min.css">

    <!-- Styles -->
    <style>
        html, body {
            background-color: #fff;
            color: #636b6f;
            font-family: 'Nunito', sans-serif;
            font-weight: 200;
            height: 100vh;
            margin: 0;
        }

        .full-height {
            /*height: 100vh;*/
        }

        .flex-center {
            align-items: center;
            display: flex;
            justify-content: center;
        }

        .position-ref {
            position: relative;
        }

        .top-right {
            position: absolute;
            right: 10px;
            top: 18px;
        }

        .content {
            text-align: center;
        }

        .title {
            font-size: 84px;
        }

        .links > a {
            color: #636b6f;
            padding: 0 25px;
            font-size: 13px;
            font-weight: 600;
            letter-spacing: .1rem;
            text-decoration: none;
            text-transform: uppercase;
        }

        .m-b-md {
            margin-bottom: 30px;
        }

        .button:hover {
            cursor: pointer;
            opacity: 0.6;
        }

        input[type="checkbox"] {
            transform: scale(1.5);
        }
    </style>
    @yield('style')
</head>
<body>
@component('components.navbar')@endcomponent
<div id="app" class="flex-center position-ref full-height">
    @if (Route::has('login'))
        <div class="top-right links">
            @auth
                <a href="{{ url('/home') }}">Home</a>
            @else
                <a href="{{ route('login') }}">Login</a>

                @if (Route::has('register'))
                    <a href="{{ route('register') }}">Register</a>
                @endif
            @endauth
        </div>
    @endif

    <div class="container-fluid m-5">
        @yield('content')
    </div>

</div>
{{-- Vue (LTS, development mode) VueDevtools はベータ版じゃないと動かない。現状 data 見れない --}}
<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.js"></script>
{{-- Vue (LTS, production mode) --}}
{{--<script src="https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.min.js"></script>--}}
{{-- Composition API --}}
<script src="https://cdn.jsdelivr.net/npm/@vue/composition-api@1.4.9"></script>
{{-- vue-chartjs --}}
{{--<script src="https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.7.1/Chart.min.js"></script>--}}
{{--<script src="https://unpkg.com/vue-chartjs/dist/vue-chartjs.min.js"></script>--}}
{{-- papa-parse --}}
<script src="https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.2/papaparse.min.js"></script>
{{-- vuetify --}}
<script src="https://cdn.jsdelivr.net/npm/vuetify@2.6.4/dist/vuetify.min.js"></script>
{{-- axios --}}
<script src="https://cdn.jsdelivr.net/npm/axios/dist/axios.min.js"></script>
{{-- dayjs --}}
<script src="https://unpkg.com/dayjs@1.8.21/dayjs.min.js"></script>
{{-- JQuery --}}
<script src="https://ajax.googleapis.com/ajax/libs/jquery/3.6.0/jquery.min.js"></script>

<script type="module">
    const {ref, reactive, onMounted, computed} = VueCompositionAPI;
        {{--import ExampleComponent from '{{asset('js/ExampleComponent.js')}}';--}}
    import CsvComponent from '{{asset('js/CsvComponent.js')}}';
    import CsvImportParent from '{{asset('js/CsvImportParent.js')}}';
    import CsvImportChild from '{{asset('js/CsvImportChild.js')}}';
    import ConditionComponent from '{{asset('js/ConditionComponent.js')}}';

    /** global helpers */
    // オブジェクトの deep コピー関数
    window.cloneObject = (object) => JSON.parse(JSON.stringify(object));
    window.formatJSON = (object) => JSON.stringify(object, null, '\t');
    // console.log の変わり、オブジェクトだったらフォーマットしてくれる
    window.debug = (...args) =>
        console.log(...args.map((arg) => typeof arg === 'object' ? formatJSON(arg) : arg));
    // eval の 代替
    window.evalFunction = (string) => (new Function('"use strict";return (' + string + ')'))();
    window.deepFreeze = (object) => {
        Object.freeze(object);

        for (const key in object) {
            const item = object[key];

            if (
                object.hasOwnProperty(key) &&
                typeof item === 'object' &&
                item !== null && !Object.isFrozen(item)
            ) {
                window.deepFreeze(item);
            }
        }
        return object;
    };
    window.camelToSnake = (string) => {
        return string.split(/(?=[A-Z])/).join('_').toLowerCase();
    };
    window.camelToSnakeObject = (object) => {
        if (typeof (object ?? undefined) === 'undefined') {
            return object;
        }
        const result = {};
        Object.keys(object).forEach(key => {
            if (Array.isArray(object[key])) {
                result[window.camelToSnake(key)]
                    = object[key].map((obj) => typeof obj !== 'object' ? obj : window.camelToSnakeObject(obj));
            } else {
                result[window.camelToSnake(key)]
                    = typeof object[key] !== 'object' ? object[key] : window.camelToSnakeObject(object[key]);
            }
        });
        return result;
    };

    new Vue({
        el: '#app',
        vuetify: new Vuetify(),
        axios,
        components: {
            // ExampleComponent,
            CsvComponent,
            CsvImportParent,
            // CsvImportChild,
            ConditionComponent,
        }
    });
</script>
<!-- JavaScript Bundle with Popper for Bootstrap -->
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js"
        integrity="sha384-MrcW6ZMFYlzcLA8Nl+NtUVF0sA7MsXsP1UyJoMp4YLEuNSfAP+JcXn/tWtIaxVXM"
        crossorigin="anonymous"></script>
</body>
</html>