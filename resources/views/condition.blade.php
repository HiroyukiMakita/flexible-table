@extends('layouts.default')
@section('style')
    <style>
    </style>
@endsection
@section('content')
    <condition-component
            :matching-url="'{{ route('matching') }}'"
            :tables="{{ json_encode($tables) }}"
    ></condition-component>
@endsection