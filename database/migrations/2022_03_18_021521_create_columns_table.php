<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateColumnsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up(): void
    {
        Schema::create('columns', static function (Blueprint $table) {
            $table->bigIncrements('id');
            $table->unsignedBigInteger('table_id');
            $table->unsignedInteger('col_index'); // csv のカラム番号何番目か
            $table->string('name');
            $table->string('type');
            $table->unsignedInteger('length')->nullable();
            $table->unsignedInteger('min')->nullable();
            $table->unsignedInteger('max')->nullable();
            $table->string('format')->nullable();
            $table->unsignedTinyInteger('encryption')->default(false);

            $table->dateTime('created_at');
            $table->dateTime('updated_at');

            $table->foreign('table_id')->references('id')->on('tables');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down(): void
    {
        Schema::dropIfExists('columns');
    }
}
