@extends('layouts.default')
@section('style')
    <style>
        .selected-multi-selector:before {
            content: '\f00că';
            font-family: FontAwesome;
        }

        .unselected-multi-selector:before {
            content: 'ăă';
            font-family: FontAwesome;
        }
    </style>
@endsection
@section('content')
    <csv-component :upload-csv-url="'{{ route('upload-csv') }}'"></csv-component>
    {{--    <csv-import-parent :upload-csv-url="'{{ route('upload-csv') }}'"></csv-import-parent>--}}
@endsection