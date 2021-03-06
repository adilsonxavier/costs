import React from "react";
import styles from "./Project.module.css";
import { useParams } from "react-router-dom";
import Loading from "../layout/Loading";
import Container from "../layout/Container";
import ProjectForm from "../project/ProjectForm";
import Message from "../layout/Message";
import ServiceForm from "../service/ServiceForm";
import { parse, v4 as uuidv4 } from "uuid";
import ServiceCard from "../service/ServiceCard";

export default function Project() {
    const { id } = useParams();

   
  //  const { id, nome } = useParams();  com mais de um parânetro

  //  console.log("meu id é" + id);
    //console.log("meu nome é" + nome);


    const [project, setProject] = React.useState({}); // Se n]ao iniciar com  um objeto vazio dá erro projec is undefined
    const [showProjectForm, setShowProjectForm] = React.useState(false);
    const [showServiceForm, setShowServiceForm] = React.useState(false);

    const [message, setMessage] = React.useState();
    const [messageType, setMessageType] = React.useState();

    const [services, setServices] = React.useState([])

    React.useEffect(() => {
        setTimeout(() => {
            fetch(`http://localhost:5001/projects/${id}`, {
                method: "get",
                headers: {
                    "content-type": "application/json"
                }
            })
                .then((resp) => resp.json())
                .then((data) => {
                    setProject(data);
                    setServices(data.services)
                })
                .catch((erro) => console.log(erro));
        }, 500);
    }, [id]
    );


    function createService(project) {
        setMessage("");

        const lastService = project.services[project.services.length - 1];
        lastService.id = uuidv4();

        const newCost = parseFloat(project.cost) + parseFloat(lastService.cost);

        if (newCost > parseFloat(project.budget)) {
            setMessage("orçamento ultrapassado" + Date.now() );
            setMessageType("error");
            project.services.pop(); // o pop remove o ultimo item do array
            return false;
        }

        project.cost = newCost;
        fetch(`http://localhost:5001/projects/${project.id}`,
            {
                method: "PATCH",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(project)
            }
        )
            .then((resp) => resp.json())
            .then((data) => {
                setServices(data.services)
                setShowServiceForm(!showServiceForm)
                setMessage('Serviço adicionado!')
                setType('success')
            })
            .catch((erro) => console.log(erro));

    }
    function toggleProjectForm() {
        setShowProjectForm(!showProjectForm);
    }

    function toggleServiceForm() {
        setShowServiceForm(!showServiceForm);
    }


    function removeService(id, cost) {
        // Este método na prática não remove diretamente no banco o serviço e sim atualiza o project sem o servico removido
        // Não me parece que esta abordagem funciona em um banco relacional, verificar

        const servicesUpdated= project.services.filter((service) => service.id != id);
        const projectUpdated = project;
        projectUpdated.services = servicesUpdated;
        projectUpdated.cost -= cost;
  
        fetch(`http://localhost:5001/projects/${projectUpdated.id}`, {
            method: "PATCH",
            headers: {
                "content-type":"application/json"
            },
            body : JSON.stringify(projectUpdated)
        })
            .then((resp) => resp.json())
            .then((data) => {
                console.log(data);
                setProject(projectUpdated);
                setServices(servicesUpdated)
                setMessage("Serviço excluido");
                setMessageType("success");
            })
            .catch((erro) => console.log("erro linha 118:"+erro));

    }

    function editPost(project) {

        setMessage(""); // Quando a mensagem é a mesma na mesma página( Ex: um projeto é atualizado mais de uma vez) a segunda
                        // mensagem de sucesso não é exibida por que a mensagem é a mesma que apareceu na primeira vez
                        // Esta linha corrige este problema

        if (project.cost > project.budget) {
            setMessage("orçamento menor que o custo");
            setMessageType("error");

            return false;
        }

        
        fetch(`http://localhost:5001/projects/${project.id}`,
            {
                method: "PATCH",
                headers: {
                    "content-type": "application/json"
                },
                body: JSON.stringify(project)
            }

        )
           
            .then((resp) => resp.json())
            .then((data) => {
               // console.log("dados "+ data);
               // alet(data);
                setProject(data);
                setShowProjectForm(false);
                setMessage("projeto atualizado");
                setMessageType("success");
 
            })
            .catch((erro) => console.log("erro foi "+erro));

    }


    return (
        <>
            {project.name
                ? (
                    <div className={ styles.project_details}>
                        <Container customClass="column">
                            {message && <Message type={messageType} msg={ message}/>}
                            <div className={ styles.details_container }>
                                <h1>Projeto: {project.name}</h1>
                                <button className={styles.btn } onClick={toggleProjectForm} >{showProjectForm ? "Fechar" : " Editar"}</button>
                                {
                                    showProjectForm ? (
                                        <div className={ styles.project_info} >
                                            <ProjectForm
                                                handleSubmit={editPost}
                                                btnText="Concluir Edição"
                                                projectData={project}
                                            />
                                        </div>
                                    ) :
                                        (
                                            <div className={styles.project_info} >
                                                <p>
                                                    <span>Categoria:  </span>{project.category.name}
                                                </p>
                                                <p>
                                                    <span>Total do Orçamento  </span> R$ {project.budget}
                                                </p>
                                                <p>
                                                    <span>Total utilizado  </span> R$ {project.cost}
                                                </p>
                                            </div>
                                        )
                                }
                            </div>
                            <div className={styles.service_form_container} >
                                <h2>adicione Serviço</h2>
                                <button className={styles.btn} onClick={toggleServiceForm} >
                                    {showServiceForm ? "Fechar serviço" : "Adicionar serviço"}
                                </button>
                                <div className={ styles.project_info }>
                                    {showServiceForm && (
                                        <ServiceForm
                                            handleSubmit={createService}
                                            btnText="Adicionar serviço"
                                            projectData={project}
                                        />
                                        )}
                                </div>
                            </div>

                            {/* Lista de Serviços do projeto */ }

                            <h2>Serviços</h2>
                            <Container customClass="start" >
                                {services.length > 0 && (
                                    services.map((service) => (
                                        <ServiceCard
                                            name={service.name}
                                            cost={service.cost}
                                            description={service.description}
                                            id={service.id}
                                            handleRemove={removeService}
                                            key={service.id}
                                        />
                                    ))
                                )}

                                {services.length == 0 && (
                                    <p> não tem serviço </p>
                                )}
                            </Container>

                        </Container>
                  </div>
              
                )
                : (<Loading/>)
            }
            
        </>
        
        );

}