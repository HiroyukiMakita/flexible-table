{{-- https://getbootstrap.jp/docs/5.0/components/navbar/ --}}
<nav class="navbar navbar-expand-lg navbar-light bg-light">
    <div class="container-fluid">
        <a class="navbar-brand" href="{{ route('top') }}">flexible-table example</a>
        <div class="collapse navbar-collapse" id="navbarSupportedContent">
            <ul class="navbar-nav me-auto mb-2 mb-lg-0">
                <li class="nav-item dropdown">
                    <a class="nav-link dropdown-toggle" href="#" id="navbarDropdown" role="button"
                       data-bs-toggle="dropdown" aria-expanded="false">
                        Pages
                    </a>
                    <ul class="dropdown-menu" aria-labelledby="navbarDropdown">
                        @php $routesA = collect(\Illuminate\Support\Facades\Route::getRoutes())->filter(function($routea){ return strpos($routea->uri(), 'api') === false; })->toArray();  @endphp
                        @foreach($routesA as $route)
                            <li><a class="dropdown-item"
                                   href="{{ route($route->getName()) }}">{{ $route->getName() }}</a></li>
                        @endforeach
                    </ul>
                </li>
            </ul>
        </div>
    </div>
</nav>