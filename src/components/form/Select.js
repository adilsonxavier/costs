import React from "react";
import styles from "./Select.module.css";

export default function Select({ type, labelText, name,options, placeHolder, handleOnChange, value }) {
    /* as propriedades foram passadas com desestruturação de objeto então no elemento que usa precisa usar os mesmos nomes mas
     * não precisa seguir a mesma ordem*/
    return (
        <div className={styles.form_control}>
            <label htmlFor={name}>{labelText}</label>
            <select name={name}
                id={name}
                onChange={handleOnChange}
                value={value || ""}
            >
                <option>Selecione Opcao</option>
                {options.map((option) => (
                    <option value={option.id} key={option.id}>{option.name }</option>)
                )}
            </select>
        </div>
    );

}